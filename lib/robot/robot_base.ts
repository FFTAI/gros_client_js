import EventEmitter from "events";
import axios, {AxiosRequestConfig} from "axios";
import {Camera} from "../common/camera";
import {System} from "../common/system";

/**
 * 实例化robot对象连接参数（可选）
 */
export interface ConnectOption {
    /**
     * 是否开启ssl认证。默认 False
     */
    ssl?: boolean;
    /**
     * robot所运行的网络IP
     */
    host?: string,
    /**
     * robot所运行的网络PORT
     */
    port?: number
}

/**
 * Robot 基类
 *
 * 实例化的时候会通过websocket连接到对应设备的控制端口！
 */
export class RobotBase extends EventEmitter {

    /**
     *  相机
     */
    public readonly camera: Camera | undefined;
    /**
     * 系统控制
     */
    public readonly system: System = new System()
    private readonly baseUrl: string = '';
    private readonly wsUrl: string = '';
    private readonly ws!: WebSocket;
    private retry_count: number = 0

    /**
     * Robot 基类构造函数
     *
     * @param {ConnectOption} option 连接参数（可选）
     */
    constructor(option?: ConnectOption) {
        super()
        console.log('Robot 初始化...')
        const {ssl = false, host = '127.0.0.1', port = '8001'} = option ?? {};

        if (ssl) {
            this.wsUrl = `wss://${host}:${port}/ws`
            this.baseUrl = `https://${host}:${port}`
        } else {
            this.wsUrl = `ws://${host}:${port}/ws`
            this.baseUrl = `http://${host}:${port}`
        }

        this.camera = new Camera(this.baseUrl)

        try {
            if (typeof window !== 'undefined') {
                // applicable to the browser
                this.ws = new WebSocket(this.wsUrl);
            } else {
                // applicable to the nodejs
                const WebSocket = require('ws')
                this.ws = new WebSocket(this.wsUrl);
            }

            this.ws.onopen = () => {
                console.log('Robot 初始化成功!')
                this.emit('open')
            }

            this.ws.onmessage = (message: MessageEvent) => {
                this.emit('message', message);
            }

            this.ws.onclose = () => {
                this.emit('close');
            }

            this.ws.onerror = (event: Event) => {
                this.emit('error', event);
            }
        } catch (e) {
            console.log('Robot 初始化失败！', e)
        }
    }

    /**
     * 启动 : 重置/归零/对设备初始状态的校准
     *
     * 当你想要控制Robot设备的时候，你的第一个指令
     */
    public async start(): Promise<any> {
        return this.http_request({
            method: "POST",
            url: "/robot/start",
        });
    }

    /**
     * 停止
     *
     * 该命令优先于其他命令! 会掉电停止。请在紧急情况下触发
     */
    public async stop(): Promise<any> {
        return this.http_request({
            method: "POST",
            url: "/robot/stop",
        });
    }


    /**
     * event : 该监听将会在Robot设备连接成功时触发
     *
     * @param listener 无参回调, 你可以在确认后执行你的业务逻辑
     */
    public on_connected(listener: () => void) {
        this.on('open', listener);
    }

    /**
     * event: 该监听将会在Robot设备连接关闭时触发
     *
     * @param listener 无参回调，你可以再次进行资源回收等类似的操作
     */
    public on_close(listener: () => void) {
        this.on('close', listener);
    }

    /**
     * event: 该监听将会在Robot设备发送错误时触发
     *
     * @param listener 会将错误信息回调
     */
    public on_error(listener: (err: Error) => void) {
        this.on('error', err => listener(err));
    }

    /**
     * 该监听将会在Robot设备主动广播消息时触发
     *
     * @param listener ，你可能需要监听该回调处理你的逻辑
     */
    public on_message(listener: (data: any) => void) {
        this.on('message', (message) => listener(message));
    }

    /**
     * 发送socket消息到Robot设备
     *
     * 这是一个内部函数: 将消息转换为字符串并发送
     * 内部做了重试机制！ 主要是为了防止客户端在socket连接不完全的时候立即发送消息
     *
     * @param message 具体的消息体
     * @protected
     */
    protected websocket_send(message: any) {
        if (this.ws && this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(message))
            this.retry_count = 0
            return
        }
        if (this.retry_count == 5) {
            throw new Error("WebSocket SendMsg Error...")
        }
        this.retry_count += 1

        console.warn("WebSocket state not ready...: retry: %s", this.retry_count)
        setTimeout(() => {
            this.websocket_send(message)
        }, 1000)
    }

    /**
     *
     * 发送http消息
     *
     * 这是一个内部函数
     *
     * @param {AxiosRequestConfig} config http请求的具体内容
     * @protected
     */
    protected async http_request<T>(config: AxiosRequestConfig): Promise<T> {
        return axios.request({
            timeout: 5000,
            baseURL: this.baseUrl,
            ...config
        })
    }

    /**
     * 参数转换，对参数做限定
     *
     * 通过参数大小阈值的限定， 使参数合法，如果超出最大阈值将转化为最大阈值返回
     *
     * @param {number} param 参数名
     * @param {string} value 参数值
     * @param {number} minThreshold 参数值最大阈值
     * @param {number} maxThreshold 参数值最小阈值
     * @protected
     */
    protected cover_param(param: number, value: string, minThreshold: number, maxThreshold: number): number {
        if (param == undefined) {
            console.warn(`Illegal parameter: ${value} = ${param} `)
            param = 0
        }
        if (param > maxThreshold) {
            console.warn(`Illegal parameter: ${value} = ${param} `,
                `greater than maximum, expected not be greater than ${maxThreshold}, actual ${param}`)
            param = maxThreshold
        }
        if (param < minThreshold) {
            console.warn(`Illegal parameter: ${value} = ${param} `,
                `greater than maximum, expected not be less than ${minThreshold}, actual ${param}`)
            param = minThreshold
        }
        return param
    }


}