import { ConnectOption, RobotBase } from "./robot_base";

/**
 * Car Mode Enumeration
 * Correspond to the parameters of the car's set_mode function.
 */
export enum CarMod {

    MOD_ACTION = 'ACTION',
    MOD_HOME = 'HOME',
    MOD_FIX = 'FIX',

    MOD_4_WHEEL = "WHEEL_4",
    MOD_3_WHEEL = "WHEEL_3",
    MOD_2_WHEEL = "WHEEL_2",
}

/**
 * 
 * The `Car` class implements the behavior of car robots and facilitates communication with its control system. It provides
    control functions and real-time status monitoring.
 */
export class Car extends RobotBase {

    private mod: CarMod | undefined

    constructor(option?: ConnectOption) {
        super(option);
    }


    /**
     * Set the motion mode of the car robot. This function sends a POST request to the "/robot/mode" endpoint with the specified mode value.
     *
     * Once completed, the car robot will move in the corresponding mode, including 4-wheel, 3-wheel, and 2-wheel modes.
     *
     * @param {CarMod} mod The mode to set, as defined in the CarMode enumeration.
     * @return {Promise} A Promise representing the completion of the mode-setting operation.
     */
    public async set_mode(mod: CarMod): Promise<any> {
        this.mod = mod
        return this.http_request({
            method: "POST",
            url: "/robot/mode",
            data: {
                "mod_val": mod.toString()
            }
        });
    }


    /**
     * Control the movement of the car (this request is sent via long-lived connection).
     *
     * @param {number} angle Angle control for direction, with a range of -45 to 45 degrees. Positive for left, negative for right. Precision of 8 decimal places.
     * @param {number} speed Speed control for forward and backward, with a range of -500 to 500. Positive for forward, negative for backward. Precision of 8 decimal places.
     */
    public move(angle: number, speed: number): void {
        angle = super.cover_param(angle, 'angle', -45, 45)
        speed = super.cover_param(speed, 'speed', -500, 500)
        super.websocket_send({
            "command": "move",
            "data": { "angle": angle, "speed": speed }
        })
    }



    // //<editor-fold desc="action">
    // /**
    //  * control motion rotation and fluctuate
    //  *
    //  * @param {number} rotate_speed  rotate speed
    //  * @param {number} fluctuate_cycle  fluctuate_cycle cycle, top and bottom once for a group
    //  * @param callback
    //  */
    // public action_rotate_and_fluctuate(rotate_speed: number, fluctuate_cycle: number, callback: () => void): void {
    //     rotate_speed = super.cover_param(rotate_speed, "rotate_speed", 0, 500)
    //
    //     let that = this
    //     let p2: number[] = [0, 0, 0, 0]
    //     let p3: number[] = [0, 0, 0, 0]
    //     let p4: number[] = [0, 0, 0, 0]
    //
    //     let fluctuate_delay_time: number = 1800
    //     let reversal_flag = false
    //     let p2_offset: number = 30
    //     let p2_current_offset: number = -30
    //
    //     const init = () => {
    //         p2 = [0, 0, 0, 0]
    //         p3 = [90, 90, 90, 90]
    //         p4 = [rotate_speed, rotate_speed, rotate_speed, rotate_speed]
    //         that.action_init(p2, p3, p4)
    //     }
    //
    //     const reversal_p2 = () => {
    //         if (reversal_flag) {
    //             p2_offset = -1 * p2_offset
    //             p2_current_offset = -2 * p2_offset
    //         } else {
    //             p2_current_offset = -30
    //             reversal_flag = true
    //         }
    //     }
    //
    //     const fluctuate_reversal_exec = () => {
    //         let cycle = 180 * 0.5;
    //         let delay_time = fluctuate_delay_time / cycle;
    //         for (let i = 0; i < cycle; i++) {
    //             setTimeout(() => {
    //                 let offset_val = p2_current_offset / cycle
    //                 p2[0] += offset_val
    //                 p2[1] += offset_val
    //                 p2[2] += offset_val
    //                 p2[3] += offset_val
    //                 that.action_send(p2, p3, p4)
    //             }, delay_time * i)
    //         }
    //     };
    //
    //     const fluctuate = () => {
    //         let delay_time = fluctuate_delay_time + 100
    //         let cycle = fluctuate_cycle * 2
    //         for (let i = 0; i <= cycle; i++) {
    //             setTimeout(() => {
    //                 if (i < cycle) {
    //                     reversal_p2()
    //                     fluctuate_reversal_exec()
    //                 } else {
    //                     that.action_destroy()
    //                     callback()
    //                     return
    //                 }
    //             }, delay_time * i)
    //         }
    //     }
    //
    //     init()
    //     fluctuate()
    //
    // }
    //
    // /**
    //  * Control car robot to DIY
    //  *
    //  * `` applicable to the car ``
    //  *
    //  * @param {number[]} p2_params Parameter values of the four motors at position 2: control ups and downs
    //  *      data range: -30.00 ～ 30.00
    //  *
    //  * @param {number[]} p3_params Parameter values of the four motors at position 3: control wheel steering
    //  *      data range: -90.00 ～ 90.00
    //  *
    //  * @param {number[]} p4_params Parameter values of the four motors at position 4: control wheel speed
    //  *      data range: -0.8 ～ 0.8
    //  */
    // public action_send(p2_params: number[] = [0, 0, 0, 0], p3_params: number[] = [0, 0, 0, 0], p4_params: number[] = [0, 0, 0, 0]): void {
    //     this.websocket_send({
    //         "command": "control_motion",
    //         "data": {
    //             "p2_m1": super.cover_param(p2_params[0], "p2_m1", -30, 30),
    //             "p2_m2": super.cover_param(p2_params[1], "p2_m2", -30, 30),
    //             "p2_m3": super.cover_param(p2_params[2], "p2_m3", -30, 30),
    //             "p2_m4": super.cover_param(p2_params[3], "p2_m4", -30, 30),
    //
    //             "p3_m1": super.cover_param(p3_params[0], "p3_m1", -90, 90),
    //             "p3_m2": super.cover_param(p3_params[1], "p3_m2", -90, 90),
    //             "p3_m3": super.cover_param(p3_params[2], "p3_m3", -90, 90),
    //             "p3_m4": super.cover_param(p3_params[3], "p3_m4", -90, 90),
    //
    //             "p4_m1": super.cover_param(p4_params[0], "p4_m1", -0.8, 0.8),
    //             "p4_m2": super.cover_param(p4_params[1], "p4_m2", -0.8, 0.8),
    //             "p4_m3": super.cover_param(p4_params[2], "p4_m3", -0.8, 0.8),
    //             "p4_m4": super.cover_param(p4_params[3], "p4_m4", -0.8, 0.8),
    //         }
    //     })
    // }
    //
    // /**
    //  * Control car robot to DIY
    //  *
    //  * `` applicable to the car ``
    //  *
    //  * @param {number[]} p2_params Parameter values of the four motors at position 2: control ups and downs
    //  *      data range: -30.00 ～ 30.00
    //  *
    //  * @param {number[]} p3_params Parameter values of the four motors at position 3: control wheel steering
    //  *      data range: -90.00 ～ 90.00
    //  *
    //  * @param {number[]} p4_params Parameter values of the four motors at position 4: control wheel speed
    //  *      data range: -0.8 ～ 0.8
    //  */
    // public action_init(p2_params: number[] = [-0.0001, -0.0001, -0.0001, -0.0001], p3_params: number[] = [], p4_params: number[] = []): void {
    //     // When the action mode is enabled! You need to send a non-zero command to activate the robot
    //     this.action_send(p2_params, p3_params, p4_params)
    //     this.set_mode(Mod.MOD_ACTION).then(() => {
    //         console.log('robot action mod init success')
    //     })
    // }
    //
    // /**
    //  * Control car robot to DIY after
    //  *
    //  * `` applicable to the car ``
    //  */
    // public action_destroy() {
    //     this.set_mode(Mod.MOD_HOME).then(() => {
    //         console.log('robot action exec end')
    //     })
    //     this.set_mode(Mod.MOD_FIX).then(() => {
    //         console.log('robot auto fix success')
    //     })
    // }
    // //</editor-fold>


}