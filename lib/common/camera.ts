import axios from 'axios';

/**
 * The Camera class is used for obtaining the video stream status and the video stream itself.
 *
 *  
 */
export class Camera {

    /**
     * Video stream URL. If the camera is not in the open state (status is false), this field is undefined.
     */
    public videoStreamUrl: string | undefined
    /**
     * Video stream status (True or False).
     */
    public videoStreamStatus: boolean = false;

    constructor(baseurl: string) {
        axios.get(`${baseurl}/control/camera_status`)
            .then(response => {
                this.videoStreamStatus = response.data.data
                if (this.videoStreamStatus) {
                    this.videoStreamUrl = `${baseurl}/control/camera`
                    console.log('Robot video stream is ready for use')
                }
            })
            .catch(err => console.error('The video stream on the robot is unavailable. Please check if the camera is securely connected and if the model is correct. Afterward, restart the device.', err));
    }
}