
import { Human } from "./lib/robot/human"
import { Car, CarMod } from "./lib/robot/car"
import axios from "axios";
import { ConnectOption } from "./lib/robot/robot_base";
import { Camera } from "./lib/common/camera";
import { System } from "./lib/common/system";


/**
 * This function allows you to query the type of a robot when working with clusters or multiple robots. 
 * By iteratively invoking this function for each robot, you can accurately determine the type of each robot for precise control.
 *
 * 
 *
 * @param {ConnectOption} option - Default connection is 127.0.0.1:8001. Modify as needed {host: string, port: number}.
 */
const get_robot_type = async (option?: ConnectOption) => {
    const { ssl = false, host = '127.0.0.1', port = '8001' } = option ?? {};
    if (ssl) {
        return axios.get(`https://${host}:${port}/robot/type`)
    } else {
        return axios.get(`http://${host}:${port}/robot/type`)
    }
}

module.exports = { Human, Car, CarMod, get_robot_type }
export { Human, Car, CarMod, Camera, System, get_robot_type } // cover_param,  websocket_send, http_request,   