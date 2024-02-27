// Import necessary modules from "../robot/robot_base"
import {ConnectOption, RobotBase} from "../robot/robot_base";

export class EndEffectorScheme {
    /**
     * 
     * @param x - position for x
     * @param y - position for y
     * @param z - position for z
     * @param qx - Quaternion .x
     * @param qy - Quaternion .y
     * @param qz - Quaternion .z
     * @param qw - Quaternion .w
     * @param vx - Velocity for x
     * @param vy - Velocity for y
     * @param vz - Velocity for z
     */
    constructor(
        // Position
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
        // Quaternion
        public qx: number = 0,
        public qy: number = 0,
        public qz: number = 0,
        public qw: number = 0,
        // Angular Velocity（Reserved field）
        public vx: number = 0,
        public vy: number = 0,
        public vz: number = 0
    ) {
    }
}

export class EndEffector extends RobotBase {
    constructor(option?: ConnectOption) {
        super(option);
    }

    enable() {
        /** Enable the end control service. */
        return super.http_request({ url: '/robot/end_effector/enable', method: "GET" });
    }

    disable() {
        /** Disable the end control service */
        return super.http_request({ url: '/robot/end_effector/disable', method: "GET" });
    }

    enable_state(frequency = 1) {
        /** Enable status monitoring to obtain information such as current position and Angle! */
        return super.http_request({ url: `/robot/enable_terminal_state?frequency=${frequency}`, method: "GET" });
    }

    disable_state() {
        /** Disable status monitoring */
        return super.http_request({ url: '/robot/enable_terminal_state', method: "GET" });
    }

    control_left(param: EndEffectorScheme) {
        /** Controlling left hand */
        const data = {
            "param": {
                "x": param.x,
                "y": param.y,
                "z": param.z,
                "qx": param.qx,
                "qy": param.qy,
                "qz": param.qz,
                "qw": param.qw,
                "vx": param.vx,
                "vy": param.vy,
                "vz": param.vz
            }
        };
        super.websocket_send({ command: 'left_hand_pr', 'data': data });
    }

    control_right(param: EndEffectorScheme) {
        /** Controlling right hand */
        const data = {
            "param": {
                "x": param.x,
                "y": param.y,
                "z": param.z,
                "qx": param.qx,
                "qy": param.qy,
                "qz": param.qz,
                "qw": param.qw,
                "vx": param.vx,
                "vy": param.vy,
                "vz": param.vz
            }
        };
        super.websocket_send({ command: 'right_hand_pr', 'data': data });
    }
}