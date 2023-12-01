/**
 * Importing necessary modules and classes for the RobotBase.
 * EventEmitter for handling events;axios for making HTTP requests;Camera class for capturing video stream;System class for system-level control commands
 */
// 
import EventEmitter from "events";// Importing EventEmitter for handling events
import axios, { AxiosRequestConfig } from "axios";
import { Camera } from "../common/camera";
import { System } from "../common/system";

/**
 * Instantiation parameters for the robot object (optional)
 */
export interface ConnectOption {
    /**
     * Whether to enable SSL authentication. Default is False.
     */
    ssl?: boolean;
    /**
     * IP of the robot.
     */
    host?: string,
    /**
     * The network PORT of the robot.
     */
    port?: number
}

/**
 * Base class for robot functionalities and connection setup.
 *
 * Connect to the port of the robot via WebSocket during instantiation.
 */
export class RobotBase extends EventEmitter {

    /**
     *  Used to capture video stream and get video stream status.
     */
    public readonly camera: Camera | undefined;
    /**
     * System level control commands, such as startup, reboot and reset.
     */
    public readonly system: System = new System()
    private readonly baseUrl: string = '';
    private readonly wsUrl: string = '';
    private readonly ws!: WebSocket;
    private retry_count: number = 0

    /**
     * Constructor for the base class of the robot.
     * Initializes the robot, establishes a connection, and sets up necessary parameters.
     * @param {ConnectOption} option - Optional parameters for establishing the connection.
     */
    constructor(option?: ConnectOption) {
        super()
        console.log('The robot is initializing...')
        const { ssl = false, host = '127.0.0.1', port = '8001' } = option ?? {};

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
                // applicable to Node.js
                const WebSocket = require('ws')
                this.ws = new WebSocket(this.wsUrl);
            }

            this.ws.onopen = () => {
                console.log('Robot initialization successful.')
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
            console.log('Robot initialization failed.', e)
        }
    }

    /**
     * Initiates the process to reset, zero, or calibrate the robot, bringing it to its initial state.
     * This command is crucial when you intend to take control of the robot, ensuring it starts from a known and calibrated position.
     * @returns {Promise<any>} - A promise that resolves with the result of the start command.
     *
     * @remarks
     * Ensure that the robot has sufficient clearance and is ready for the calibration process before issuing this command.
     *      
     */
    public async start(): Promise<any> {
        return this.http_request({
            method: "POST",
            url: "/robot/start",
        });
    }

    /**
     * Initiates the process to safely power down the robot. This command takes precedence over other commands, ensuring an orderly shutdown. It is recommended to trigger this command in emergency situations or when an immediate stop is necessary.
     * @returns {Promise<any>} - A promise that resolves with the result of the stop command.
     * @remarks
     * Use this command with caution, as it results in a powered-down state of the robot. Ensure that there are no critical tasks or movements in progress before invoking this command to prevent unexpected behavior.
     */
    public async stop(): Promise<any> {
        return this.http_request({
            method: "POST",
            url: "/robot/stop",
        });
    }


    /**
     * Triggered when the robot is successfully connected.
     * This event allows you to set up a listener for the successful connection to the robot. It is recommended to execute your business logic or perform additional actions after confirming the connection.
     * @param listener - A callback function without parameters that you can execute once the connection is confirmed.
     * @remarks
     * It's essential to handle the 'onConnected' event to ensure that your application responds appropriately to the successful connection of the robot.
     */
    public on_connected(listener: () => void) {
        this.on('open', listener);
    }

    /**
     * Triggered when the robot device connection is closed. You can use this event to perform resource cleanup or similar operations after the connection is closed.
     *
     * @param listener A callback function without parameters that you can execute once the connection is closed.
     * @remarks
     * It's crucial to handle the 'onClosed' event to manage resources or take specific actions when the robot connection is closed.
     */
    public on_close(listener: () => void) {
        this.on('close', listener);
    }

    /**
     * Triggered when an error occurs in the robot. Managing errors effectively can ensure the stability of your application.
     *
     * @param listener A callback function that takes an error parameter and can be used to handle the error information.
     */
    public on_error(listener: (err: Error) => void) {
        this.on('error', err => listener(err));
    }

    /**
     * Triggered when the robot actively broadcasts a message.
     *
     * @param listener You may need to listen to this event to handle specific logic related to the broadcasted message.
     */
    public on_message(listener: (data: any) => void) {
        this.on('message', (message) => listener(message));
    }

    /**
     * This function is used to send a WebSocket message to the robot device. 
     *
     * This is an internal function that converts the message to a string and sends it to the robot. It includes a retry mechanism to prevent immediate message sending when the socket connection is not fully established.
     *      *
     * @param message The specific message body to be sent.
     * @protected
     */
    protected websocket_send(message: any) {
        if (this.ws && this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(message))
            this.retry_count = 0
            return
        }
        if (this.retry_count == 5) {
            throw new Error("Failed to send WebSocket message: Maximum retry limit reached.")
        }
        this.retry_count += 1

        console.warn("WebSocket not ready: Retrying (attempt %s)", this.retry_count)
        setTimeout(() => {
            this.websocket_send(message)
        }, 1000)
    }

    /**
     *
     * This is an internal function that sends an HTTP request to the robot device based on the provided Axios request configuration. It returns a Promise with the specified response type.
     *
     * 
     *
     * @param {AxiosRequestConfig} config The specific configuration for the HTTP request.
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
     * This internal function is designed to handle a numerical parameter along with its value, minimum, and maximum thresholds. It guarantees that the parameter stays within the defined range, and if it falls outside those bounds, it adjusts it to the nearest threshold.
     *
     * 
     * @param {number} value - The parameter value.
     * @param {string} name - The parameter name.
     * @param {number} minThreshold - The minimum threshold for the parameter value.
     * @param {number} maxThreshold - The maximum threshold for the parameter value.
     * @protected
     */
    protected cover_param(value: number, name: string, minThreshold: number, maxThreshold: number): number {
        if (value == undefined) {
            console.warn(`Invalid parameter: ${name} is ${value}. The value 0 will be used `)
            value = 0
        }
        if (value > maxThreshold) {
            console.warn(`Invalid parameter: ${name} (${value}) exceeds maximum allowed value (${maxThreshold}). The maximum value (${maxThreshold}) will be used.`)
            value = maxThreshold
        }
        if (value < minThreshold) {
            console.warn(`Invalid parameter:  ${name} (${value}) is less than the minimum allowed value ${minThreshold}. The minimum value (${minThreshold}) will be used.`)
            value = minThreshold
        }
        return value
    }


}