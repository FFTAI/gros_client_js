// Import necessary modules from "../robot/robot_base"
import {ConnectOption, RobotBase} from "../robot/robot_base";

// Define the Motor class
export class MotorScheme {
    constructor(
        public no: string,
        public orientation: string,
        public angle: number
    ) {
    }
}

/**
 * The Human class implements the behavior of the GR robot. It establishes a connection
 to the robot and offers control functions along with status monitoring.
 */
export class Motor extends RobotBase {
    public motor_limits: Array<any> = [];

    // Constructor with an optional parameter for connection options
    constructor(option?: ConnectOption) {
        super(option);
        this.get_motor_limit_list()
            .then((res) => {
                this.motor_limits = res.data.data;
            })
            .catch((error) => {
                console.log(error);
            });
    }

    /**
     * This function is used to retrieve the motor limits.
     *
     * @return {Promise}  returns a promise that, when resolved, provides information about the motor limits.
     */
    public async get_motor_limit_list(): Promise<any> {
        return super.http_request({
            method: "GET",
            url: "/robot/motor/limit/list",
        });
    }

    /**
     * This function is used to move joints to specified positions, considering motor limits.
     * It facilitates the movement of multiple joints of the robot. It takes an array of motors with target angles and ensures that each joint's movement adheres to predefined motor limits.
     *
     * @param {Array<Motor>} args - An array of motors specifying the joints to be moved. Each motor object in the array should have properties: 'no' (joint number), 'orientation' (joint orientation), and 'angle' (target angle).
     * @return {Promise}  A promise that resolves once the joint movement command has been executed.
     *
     */
    private move_joint(args: Array<MotorScheme>) {
        const motors: any = [];
        const target_list: any = [];

        // Step 1: Construct a list of motors with specified target angles.
        args.forEach((motor) => {
            motors.push({
                no: motor.no,
                orientation: motor.orientation,
                angle: motor.angle,
            });
        });

        // Step 2: Check for the availability of motor limits. If not available, retry after a delay.
        if (this.motor_limits.length == 0) {
            setTimeout(() => {
                this.move_joint(args);
            }, 500);
            return;
        }

        // Step 3: Compare each specified motor with its corresponding motor limit.
        motors.forEach((item1: { no: any; orientation: any }) => {
            this.motor_limits.forEach((item2: { no: any; orientation: any }) => {
                if (item1.no == item2.no && item1.orientation == item2.orientation)
                    target_list.push({...item1, ...item2});
            });
        });

        // Step 4: Adjust the target angles based on the motor limits.
        if (target_list.length > 0) {
            target_list.forEach((motor: { [x: string]: any }) => {
                motor["angle"] = super.cover_param(motor["angle"], "angle", motor["min_angle"], motor["max_angle"]);
                delete motor["min_angle"];
                delete motor["max_angle"];
                delete motor["ip"];
            });

            // Step 5: Send the adjusted command to move the joints using a WebSocket connection.
            super.websocket_send({
                command: "move_joint",
                data: {command: target_list},
            });
        }
    }

    /**
     * Set PD mode for a specific motor.
     *
     * @param {String} no  Motor number.
     * @param {String} orientation  Motor orientation.
     */
    public set_motor_pd_flag(no: string, orientation: string) {
        const data = {
            no: no,
            orientation: orientation,
        };
        super.websocket_send({
            command: "check_motor_for_flag",
            data: {command: data},
        });
    }

    /**
     * Set the parameters for a Proportional-Derivative (PD) control mode for a specific motor.
     * This function allows you to configure the proportional (P) and derivative (D) gains for the motor.
     * Providing valid values for 'no' (motor number), 'orientation' (motor orientation), 'p' (proportional gain),
     * and 'd' (derivative gain) is crucial for accurate and stable motor control.
     *
     * @param {String} no  Motor number.
     * @param {String} orientation  Motor orientation.
     * @param {Number} p  Proportional gain value.
     * @param {Number} d  Derivative gain value.
     */
    public set_motor_pd(no: string, orientation: string, p: number = 0.36, d: number = 0.042) {
        const data = {
            no: no,
            orientation: orientation,
            p: p,
            d: d,
        };
        super.websocket_send({
            command: "check_motor_for_set_pd",
            data: {command: data},
        });
    }

    /**
     * Enable the specified motor.
     *
     * @param {String} no  Motor number.
     * @param {String} orientation  Motor orientation.
     */
    public enable_motor(no: string, orientation: string) {
        if (parseInt(no) > 8) {
            console.log(
                `Motor enabled fail: This function can only control 0-8. But current value: ${no}`
            );
            return;
        }
        const data = {
            no: no,
            orientation: orientation,
        };
        super.websocket_send({
            command: "enable_motor",
            data: {command: data},
        });
    }

    /**
     * Disable the specified motor.
     *
     * @param {String} no  Motor number.
     * @param {String} orientation  Motor orientation.
     */
    public disable_motor(no: string, orientation: string) {
        if (parseInt(no) > 8) {
            console.log(
                `Motor enabled fail: This function can only control 0-8. But current value: ${no}`
            );
            return;
        }
        const data = {
            no: no,
            orientation: orientation,
        };
        super.websocket_send({
            command: "disable_motor",
            data: {command: data},
        });
    }

    //  Enable the Hand for individual control.
    public async enable_hand() {
        return super.http_request({
            method: "GET",
            url: "/robot/motor/hand/enable",
        });
    }

    //  Disable the Hand for individual control.
    public async disable_hand() {
        return super.http_request({
            method: "GET",
            url: "/robot/motor/hand/disable",
        });
    }

    /**
     * Move a specific motor to the specified angle.
     *
     * @param {String} no  Motor number.
     * @param {String} orientation  Motor orientation.
     * @param {Number} angle  angle for the motor.
     */
    public move_motor(no: string, orientation: string, angle: number) {
        const motors: any = [];
        motors.push({
            no: no,
            orientation: orientation,
            angle: angle,
        });
        this.move_joint(motors);
    }

    /**
     * Get the Position, Velocity, and Current (PVC) information for a specific motor.
     *
     * @param {String} no  Motor number.
     * @param {String} orientation  Motor orientation.
     */
    public async get_motor_pvc(no: string, orientation: string): Promise<any> {
        const data = {
            no: no,
            orientation: orientation,
        };
        return super.http_request({
            method: "POST",
            url: "/robot/motor/pvc",
            data: data
        });
    }

    /**
     * Get the current position of the robot's hand.
     *
     */
    public async get_hand_position(): Promise<any> {
        return super.http_request({
            method: "POST",
            url: "/robot/motor/hand/state"
        });
    }
}
