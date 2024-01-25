// Import necessary modules from "../robot/robot_base"
import {ConnectOption, RobotBase} from "../robot/robot_base";

// Define the Motor class
export class MotorScheme {
    constructor(public no: string, public orientation: string, public angle: number) {
    }
}

/**
 * The Human class implements the behavior of the GR robot. It establishes a connection
 to the robot and offers control functions along with status monitoring.
 */
export class Motor extends RobotBase {

    private motor_limits: Array<any> = []

    // Constructor with an optional parameter for connection options
    constructor(option?: ConnectOption) {
        super(option);
        this.get_motor_limit_list().then(res => {
            this.motor_limits = res.data.data
        }).catch(error => {
            console.log(error)
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
    public async move_joint(args: Array<MotorScheme>): Promise<void> {
        const motors: any = [];
        const target_list: any = [];

        // Step 1: Construct a list of motors with specified target angles.
        args.forEach(motor => {
            motors.push({no: motor.no, orientation: motor.orientation, angle: motor.angle})
        });

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
                    target_list.push({...item1, ...item2})
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
            super.websocket_send({'command': 'move_joint', 'data': {"command": target_list}})
        }
    }

}