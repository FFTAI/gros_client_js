import {Human} from "./lib/robot/human"
import {Car, CarMod} from "./lib/robot/car"
import axios from "axios";
import {ConnectOption} from "./lib/robot/robot_base";
import {Camera} from "./lib/common/camera";
import {System} from "./lib/common/system";


/**
 * 获取Robot类型
 *
 * 当你使用群集或者多设备的时候 你可以遍历调用该接口依次从设备上读取类型，以便于您做出准确的控制
 *
 * @param {ConnectOption} option 连接对象，默认连接127.0.0.1:8001 请根据需要修改{host: str, port: number}
 */
const get_robot_type = async (option?: ConnectOption) => {
    const {ssl = false, host = '127.0.0.1', port = '8001'} = option ?? {};
    if (ssl) {
        return axios.get(`https://${host}:${port}/robot/type`)
    } else {
        return axios.get(`http://${host}:${port}/robot/type`)
    }
}

module.exports = {Human, Car, CarMod, get_robot_type}
export {Human, Car, CarMod, Camera, System, get_robot_type}