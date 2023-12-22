import {ConnectOption, RobotBase} from "./robot_base";

export class Motor {
    constructor(public no: string, public orientation: string, public angle: number) {}
}

export enum ArmAction {
    // 归零
    RESET = "RESET",
    // 左挥手
    LEFT_ARM_WAVE = "LEFT_ARM_WAVE",
    // 双臂挥手
    TWO_ARMS_WAVE = "TWO_ARMS_WAVE",
    // 甩胳膊
    ARMS_SWING = "ARMS_SWING",
    // 打招呼
    HELLO = "HELLO"
}

export enum HandAction {
    // 半握手
    HALF_HANDSHAKE = "HALF_HANDSHAKE",
    // 竖大拇指
    THUMB_UP = "THUMB_UP",
    // 手张开
    OPEN = "OPEN",
    // 手微屈
    SLIGHTLY_BENT = "SLIGHTLY_BENT",
    // 抓握
    GRASP = "GRASP",
    // 抖动手
    TREMBLE = "TREMBLE",
    // 握手
    HANDSHAKE = "HANDSHAKE"
}

export enum BodyAction {
    //下蹲
    SQUAT = "SQUAT",
    //扭腰
    ROTATE_WAIST = "ROTATE_WAIST"
}

/**
 * GR-1人形机器人对象
 *
 * 在你需要连接GR-1人形机器人的时候，你可以创建一个new Human()对象！ 这将会在后台连接到人形的控制系统，并提供对应的控制函数和状态监听！
 */
export class Human extends RobotBase {

    private motor_limits: Array<any> = []
    constructor(option?: ConnectOption) {
        super(option);
        this.get_motor_limit_list().then(res=>{
            this.motor_limits = res.data.data
        }).catch(error=>{console.log(error)})
    }

    /**
     * GR-01人形设备将会原地站立
     *
     * 当进行了start之后如果你想对GR-01人形设备进行指令控制，你同样需要调用该函数让其位置stand的模式。
     * 如果是在行走过程中需要停止，你同样可以调用该函数进行stand
     *
     * @return {Promise}  return
     */
    public async stand(): Promise<any> {
        return super.http_request({
            method: "POST",
            url: "/robot/stand"
        })
    }

    /**
     * 获取关节限位
     *
     * @return {Promise}  return
     */
    public async get_joint_limit(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/join_limit",
        })
    }

    /**
     * 获取关节状态
     *
     * @return {Promise}  return
     */
    public async get_joint_states(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/joint_states",
        })
    }

    /**
     * 开启state调试模式
     * 触发该函数将会在后台触发GR-01人形设备主动发送状态值的指令，因此对应的你需要监听on_message函数进行处理\
     *
     * @param {number} frequence 频率 (整数)
     * @return {Promise}  return
     */
    public async enable_debug_state(frequence: number = 1): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/enable_states_listen",
            params: {
                frequence: frequence
            }
        })
    }

    /**
     * 关闭state调试模式
     * @return {Promise}  return
     */
    public async disable_debug_state(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/disable_states_listen",
        })
    }

    /**
     * 控制GR-01人形设备行走 (该请求维持了长链接的方式进行发送)
     *
     * @param {number} angle 角度 控制方向，取值范围为正负45度。向左为正，向右为负！(浮点数8位)
     * @param {number} speed 速度 控制前后，取值范围为正负0.8。向前为正，向后为负！(浮点数8位)
     */
    public walk(angle: number, speed: number): void {
        angle = super.cover_param(angle, 'angle', -45, 45)
        speed = super.cover_param(speed, 'speed', -0.8, 0.8)
        super.websocket_send({
            "command": "move",
            "data": {"angle": angle, "speed": speed}
        })
    }


    /**
     * 控制GR-01人形头部运动 (该请求维持了长链接的方式进行发送)
     *
     * @param {number} roll  （翻滚角）：描述围绕x轴旋转的角度，左转头为负，向右转为正，范围（-17.1887-17.1887）
     * @param {number} pitch （俯仰角）：描述围绕y轴旋转的角度。前点头为正，后点头为负，范围（-17.1887-17.1887）
     * @param {number} yaw   （偏航角）：描述围绕z轴旋转的角度。左扭头为负，右扭头为正，范围（-17.1887-17.1887）
     */
    public head(roll: number, pitch: number, yaw: number): void {
        roll = super.cover_param(roll, 'roll', -17.1887, 17.1887)
        pitch = super.cover_param(pitch, 'pitch', -17.1887, 17.1887)
        yaw = super.cover_param(yaw, 'yaw', -17.1887, 17.1887)
        super.websocket_send({"command": "head", "data": {"roll": roll, "pitch": pitch, "yaw": yaw}})
    }

    /**
     * 控制GR-01人形设备下肢运动 (该请求维持了长链接的方式进行发送)
     *
     * @param {number} squat 下蹲 控制上下，取值范围-0.15~0。向下为负，0回正。
     * @param {number} rotate_waist 扭腰 控制左右，取值范围为正负14.32。向左为正，向右为负！(浮点数8位)
     */
    public body(squat: number, rotate_waist: number): void {
        squat = super.cover_param(squat, 'squat', -0.15, 0)
        rotate_waist = super.cover_param(rotate_waist, 'rotate_waist', -14.32, 14.32)
        super.websocket_send({
            "command": "lower_body",
            "data": {"squat": squat, "rotate_waist": rotate_waist}
        })
    }

    /**
     * 控制GR-01人形设备上肢
     * 
     * @param {string} arm_action 胳膊  归零:RESET 左挥手:LEFT_ARM_WAVE 双臂挥手:TWO_ARMS_WAVE 甩胳膊:ARMS_SWING 打招呼:HELLO
     * @param {string} hand_action 手  半握手:HALF_HANDSHAKE 竖大拇指:THUMBS_UP 手张开:OPEN 手微屈:SLIGHTLY_BENT 抓握:GRASP 抖动手:TREMBLE 握手:HANDSHAKE
     */
    public async upper_body(arm_action?: ArmAction,hand_action?: HandAction): Promise<any> {
        return super.http_request({
            method: "POST",
            url: "/robot/upper_body",
            data: {
                arm_action: arm_action,
                hand_action: hand_action
            }
        })
    }

    /**
     * 控制GR-01人形设备下肢
     * 
     * @param {string} lower_body_mode 动作模式：SQUAT-下蹲、ROTATE_WAIST-扭腰
     */
    public async lower_body(lower_body_mode?: BodyAction): Promise<any> {
        return super.http_request({
            method: "POST",
            url: "/robot/lower_body",
            data: {
                lower_body_mode: lower_body_mode
            }
        })
    }

    /**
     * 获取电机限位
     * 
     * @return {Promise}  return
     */
    public async get_motor_limit_list(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/motor/limit/list"
        })
    }

    /**
     * 移动关节
     * 
     * @return {Promise}  return
     */
    public async move_joint(args: Array<Motor>): Promise<void> {
        var motors: any = []
        var target_list: any = []
        args.forEach(motor => {
            motors.push({no: motor.no, orientation: motor.orientation, angle: motor.angle})
        });
        console.log('motor_limits',this.motor_limits)
        if(this.motor_limits.length == 0) {
            setTimeout(() => {
                this.move_joint(args)
            }, 500);
            return
        }
        motors.forEach((item1: { no: any; orientation: any; }) => {
            this.motor_limits.forEach((item2: { no: any; orientation: any; }) => {
                if (item1.no == item2.no && item1.orientation == item2.orientation)
                    target_list.push({...item1,...item2})
            });
        });
        if (target_list.length > 0) {
            target_list.forEach((motor: { [x: string]: any; }) => {
                motor['angle'] = super.cover_param(motor['angle'], 'angle', motor['min_angle'], motor['max_angle']);
                delete motor['min_angle'];
                delete motor['max_angle'];
                delete motor['ip'];
            });
            console.log('target_list',target_list)
            super.websocket_send({'command': 'move_joint', 'data': {"command": target_list}})
        } 
    }

    /**
     * 启动控制程序
     *
     */
    public async control_svr_start(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/sdk_ctrl/start",
        })
    }

    /**
     * 关闭控制程序
     *
     * @return {Promise}  return
     */
    public async control_svr_close(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/sdk_ctrl/close",
        })
    }
    /**
     * 查看控制程序状态
     *
     * @return {Promise}  return
     */
    public async control_svr_status(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/sdk_ctrl/status",
        })
    }
    /**
     * 查看控制程序日志
     *
     */
    public async control_svr_log_view(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/sdk_ctrl/log",
        })
    }
}