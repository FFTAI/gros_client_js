import axios from 'axios';

/**
 *  相机
 *
 *  用于获取视频流状态和视频流
 */
export class Camera {

    /**
     * 视频流地址。如果相机开启状态为false 则该字段为 undefined
     */
    public videoStreamUrl: string | undefined
    /**
     * 视频流状态 True OR False
     */
    public videoStreamStatus: boolean = false;

    constructor(baseurl: string) {
        axios.get(`${baseurl}/control/camera_status`)
            .then(response => {
                this.videoStreamStatus = response.data.data
                if (this.videoStreamStatus) {
                    this.videoStreamUrl = `${baseurl}/control/camera`
                    console.log('Robot 视频流状态可用...')
                }
            })
            .catch(err => console.error('Robot 视频流状态不可用！ 请检查后重启设备...', err));
    }
}