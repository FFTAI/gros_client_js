import {ArmAction, BodyAction, HandAction, Human} from "./lib/robot/human";
import {Motor, MotorScheme} from "./lib/motor/motor";
import {EndEffector, EndEffectorScheme} from './lib/end_effector/end_effector'
import {Car, CarMod} from "./lib/robot/car";
import axios from "axios";
import {ConnectOption, RobotBase} from "./lib/robot/robot_base";
import {Camera} from "./lib/common/camera";
import {System} from "./lib/common/system";

/**
 * This function allows you to query the type of a robot when working with clusters or multiple robots.
 * By iteratively invoking this function for each robot, you can accurately determine the type of each robot for precise control.
 * A successful return of the message also indicates that the connection to robot is operating smoothly.
 * @param {ConnectOption} option - Default connection is 127.0.0.1:8001. Modify as needed {host: string, port: number}.
 */
const get_robot_type = async (option?: ConnectOption) => {
    const {ssl = false, host = '127.0.0.1', port = '8001'} = option ?? {};
    if (ssl) {
        return axios.get(`https://${host}:${port}/robot/type`);
    } else {
        return axios.get(`http://${host}:${port}/robot/type`);
    }
};

// Exporting elements using CommonJS syntax
module.exports = {
    Human,
    Car,
    CarMod,
    Camera,
    System,
    get_robot_type,
    ArmAction,
    RobotBase,
    HandAction,
    BodyAction,
    Motor,
    MotorScheme,
    EndEffector,
    EndEffectorScheme
}
// Exporting elements using ES6 syntax
export {
    Human,
    Car,
    CarMod,
    Camera,
    System,
    get_robot_type,
    ArmAction,
    RobotBase,
    HandAction,
    BodyAction,
    Motor,
    MotorScheme,
    EndEffector,
    EndEffectorScheme
};

