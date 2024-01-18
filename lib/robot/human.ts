// Import necessary modules from "./robot_base" 
import { ConnectOption, RobotBase } from "./robot_base";

// Define the Motor class
export class Motor {
    constructor(public no: string, public orientation: string, public angle: number) { }
}

// Define the ArmAction enumeration
export enum ArmAction {
    // Reset
    RESET = "RESET",
    // Wave left arm
    LEFT_ARM_WAVE = "LEFT_ARM_WAVE",
    // Wave two arms
    TWO_ARMS_WAVE = "TWO_ARMS_WAVE",
    // Swing arms
    ARMS_SWING = "ARMS_SWING",
    // Wave hello
    HELLO = "HELLO"
}

// Define the HandAction enumeration
export enum HandAction {
    // Half handshake
    HALF_HANDSHAKE = "HALF_HANDSHAKE",
    // Thumb up
    THUMB_UP = "THUMB_UP",
    // Open hands
    OPEN = "OPEN",
    // Slightly bend hands
    SLIGHTLY_BENT = "SLIGHTLY_BENT",
    // Grasp
    GRASP = "GRASP",
    // Tremble
    TREMBLE = "TREMBLE",
    // Handshake
    HANDSHAKE = "HANDSHAKE"
}

// Define the BodyAction enumeration
export enum BodyAction {
    //Squat
    SQUAT = "SQUAT",
    //Rotate waist
    ROTATE_WAIST = "ROTATE_WAIST"
}

/**
 * The Human class implements the behavior of the GR robot. It establishes a connection
    to the robot and offers control functions along with status monitoring.
 */
export class Human extends RobotBase {

    private motor_limits: Array<any> = []

    // Constructor with an optional parameter for connection options
    constructor(option?: ConnectOption) {
        super(option);
        this.get_motor_limit_list().then(res => {
            this.motor_limits = res.data.data
        }).catch(error => { console.log(error) })
    }

    /**
     * Use this function to make the robot stand up from a resting position or other positions.
     * Once you've called start() and waited for stabilization, go ahead and use stand() to get the robot into a standing position. Only after making the stand() call can you then give further control commands or motion instructions.
     * If the robot is walking or in the middle of other movements, you can also use this function to bring it to a stop.
     * @return {Promise}  Returns a promise.
     */
    public async stand(): Promise<any> {
        return super.http_request({
            method: "POST",
            url: "/robot/stand"
        })
    }

    /**
     * Retrieve the joint limits of the robot, including the permissible range of motion for each joint. Understanding these limits is crucial for ensuring the robot's movements stay within safe and operational parameters, preventing potential damage or errors. 
     *
     * @return {Promise}  A promise that, when resolved, provides information about the joint limits of the robot.
     */
    public async get_joint_limit(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/joint_limit",
        })
    }

    /**
     * Retrieve the current joint states of the robot.This data is essential for monitoring and controlling the robot's articulation in real-time, enabling precise adjustments and ensuring the robot's overall operational status.
     *
     * @return {Promise}  A returned promise that, when resolved, provides detailed information about the current positions, velocities, and efforts of the robot's joints.
     */
    public async get_joint_states(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/joint_states",
        })
    }

    /**
     * This function is used to enable the debug state mode, allowing the robot to actively send periodic state updates. This is beneficial for real-time monitoring.
     * To handle and process the received data, be sure to listen to the 'on_message' function.
     *
     * @param {number} frequence Frequency (integer)
     * @return {Promise}  Return a promise
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
     * This function disables the debug state mode, stopping the periodic state updates from the robot. 
     * @return {Promise}  Return a promise
     */
    public async disable_debug_state(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/disable_states_listen",
        })
    }

    /**
     * Control the walking behavior of the robot. This request is sent via a long-lived connection.
     * @param {number} angle specifies the direction of movement, with a range of -45 to 45 degrees. Negative values indicate a right turn, while positive values indicate a left turn.
     * @param {number} speed adjusts the speed of forward and backward motion, ranging from -0.8 to 0.8. Negative values correspond to backward movement, and positive values correspond to forward movement.
     */
    public walk(angle: number, speed: number): void {
        angle = super.cover_param(angle, 'angle', -45, 45)
        speed = super.cover_param(speed, 'speed', -0.8, 0.8)
        super.websocket_send({
            "command": "move",
            "data": { "angle": angle, "speed": speed }
        })
    }


    /**
     * Control the movement of the robot's head. This request is sent via a long-lived connection.
     *
     * @param {number} roll specify the rotation around the x-axis. Negative values turn the head to the left, and positive values turn it to the right. Range: -17.1887 to 17.1887.
     * @param {number} pitch specify the rotation around the y-axis. Positive values tilt the head forward, and negative values tilt it backward. Range: -17.1887 to 17.1887.
     * @param {number} yaw specify the rotation around the z-axis. Negative values twist the head to the left, and positive values twist it to the right. Range: -17.1887 to 17.1887.
     */
    public head(roll: number, pitch: number, yaw: number): void {
        roll = super.cover_param(roll, 'roll', -17.1887, 17.1887)
        pitch = super.cover_param(pitch, 'pitch', -17.1887, 17.1887)
        yaw = super.cover_param(yaw, 'yaw', -17.1887, 17.1887)
        super.websocket_send({ "command": "head", "data": { "roll": roll, "pitch": pitch, "yaw": yaw } })
    }

    /**
     *Control the movement of the robot's body. This request is sent via a long-lived connection. 
     *
     * @param {number} squat controls the up-and-down movement, ranging from -0.15 to 0. Negative values for downward motion, 0 for neutral position.
     * @param {number} rotate_waist controls left-and-right rotation, with a range of -14.32 to 14.32. Positive values for left rotation, negative for right rotation. Precision of 8 decimal places.
     */
    public body(squat: number, rotate_waist: number): void {
        squat = super.cover_param(squat, 'squat', -0.15, 0)
        rotate_waist = super.cover_param(rotate_waist, 'rotate_waist', -14.32, 14.32)
        super.websocket_send({
            "command": "lower_body",
            "data": { "squat": squat, "rotate_waist": rotate_waist }
        })
    }

    /**
     * This functions is used to control the upper body movements of the robot.
     * 
     * @param {string} arm_action ZERO_RESET for resetting, LEFT_ARM_WAVE for waving with the left arm, TWO_ARMS_WAVE for waving with both arms, ARMS_SWING for swinging arms, HELLO for waving hello.
     * @param {string} hand_action HALF_HANDSHAKE for a half handshake, THUMBS_UP for a thumbs-up, OPEN for an open hand, SLIGHTLY_BENT for a slightly bent hand, GRASP for grasping, TREMBLE for trembling, HANDSHAKE for a handshake.
     */
    public async upper_body(arm_action?: ArmAction, hand_action?: HandAction): Promise<any> {
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
     * This function is used to control the lower body movements of the robot.
     * 
     * @param {string} lower_body_mode SQUAT for squatting, ROTATE_WAIST for rotating the waist.
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
     * This function is used to retrieve the motor limits.
     * 
     * @return {Promise}  returns a promise that, when resolved, provides information about the motor limits.
     */
    public async get_motor_limit_list(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/motor/limit/list"
        })
    }

    /**
     * This function is used to move joints to specified positions, considering motor limits.
     * It facilitates the movement of multiple joints of the robot. It takes an array of motors with target angles and ensures that each joint's movement adheres to predefined motor limits. 
     * 
     * @param {Array<Motor>} args - An array of motors specifying the joints to be moved. Each motor object in the array should have properties: 'no' (joint number), 'orientation' (joint orientation), and 'angle' (target angle).
     * @return {Promise}  A promise that resolves once the joint movement command has been executed. 
     * 
     */
    public async move_joint(args: Array<Motor>): Promise<void> {
        var motors: any = []
        var target_list: any = []

        // Step 1: Construct a list of motors with specified target angles.
        args.forEach(motor => {
            motors.push({ no: motor.no, orientation: motor.orientation, angle: motor.angle })
        });
        console.log('motor_limits', this.motor_limits)

        // Step 2: Check for the availability of motor limits. If not available, retry after a delay.
        if (this.motor_limits.length == 0) {
            setTimeout(() => {
                this.move_joint(args)
            }, 500);
            return
        }

        // Step 3: Compare each specified motor with its corresponding motor limit.
        motors.forEach((item1: { no: any; orientation: any; }) => {
            this.motor_limits.forEach((item2: { no: any; orientation: any; }) => {
                if (item1.no == item2.no && item1.orientation == item2.orientation)
                    target_list.push({ ...item1, ...item2 })
            });
        });

        // Step 4: Adjust the target angles based on the motor limits.
        if (target_list.length > 0) {
            target_list.forEach((motor: { [x: string]: any; }) => {
                motor['angle'] = super.cover_param(motor['angle'], 'angle', motor['min_angle'], motor['max_angle']);
                delete motor['min_angle'];
                delete motor['max_angle'];
                delete motor['ip'];
            });

            // Step 5: Send the adjusted command to move the joints using a WebSocket connection.
            console.log('target_list', target_list)
            super.websocket_send({ 'command': 'move_joint', 'data': { "command": target_list } })
        }
    }

    /**
     * This function is used to start the control program. It initiates the control program for the robot by sending a request to the specified endpoint ("/robot/sdk_ctrl/start") through an HTTP GET request. The control program is responsible for managing and coordinating various aspects of the robot's behavior and functionality.
     * @return {Promise<any>} returns a promise that resolves once the control program has been started.
     * Make ensure that the robot's SDK control server is properly configured and running before invoking this function. Additionally, handle the promise resolution appropriately to account for the success or failure of the control program startup.

     */
    public async control_svr_start(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/sdk_ctrl/start",
        })
    }

    /**
     * This function is used to close the control program. It sends an HTTP GET request to the specified endpoint ("/robot/sdk_ctrl/close") to close the control program for the robot. Closing the control program stops the active management and coordination of the robot's behavior and functionality.
  
     * @return {Promise<any>} returns a promise that resolves once the control program has been closed.
     * 
     * Please be noted that before invoking this function, ensure that the control program is in a state where it can be safely closed. Handle the promise resolution appropriately to account for the success or failure of the control program closure.
     */
    public async control_svr_close(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/sdk_ctrl/close",
        })
    }
    /**
     * This function is used to check the status of the control program. 
     * @return {Promise} returns the promise with information detailing the status, allowing you to monitor and respond to the state of the control program.
     * This function is valuable for real-time monitoring and decision-making based on the operational status of the control program.
     */
    public async control_svr_status(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/sdk_ctrl/status",
        })
    }
    /**
     * This function is used to view the logs of the control program.It is valuable for troubleshooting, debugging, and gaining insights into the past behaviors of the control program.
     * @return {Promise<any>} resolves with information containing the logs, enabling you to review and analyze the historical activities and events logged by the control program.
     */
    public async control_svr_log_view(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/sdk_ctrl/log",
        })
    }
}