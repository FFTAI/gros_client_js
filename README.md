# RoCS JavaScript/TypeScript Client SDK

The SDK operates based on the concept of encapsulation, neatly organizing essential robot functions into separate classes, each equipped with specialized methods. Developers can make use of these encapsulated capabilities through provided interfaces, making it easy to create customized applications seamlessly. Whether you need to fine-tune low-level motor operations, coordinate complex high-level motion sequences, manage audio/video transmission, implement SLAM for mapping, or monitor odometry, the SDK's modular structure ensures flexibility and simplicity for developers to customize your solutions.

## Prerequisite

Prior to the setup, install Node.js and npm:

* Download and install Node.js from [nodejs.org](https://nodejs.org/).
* npm (Node Package Manager) comes bundled with Node.js.
* Verify installation by running `node -v` and `npm -v` in your terminal.

## Installing JavaScript/TypeScript SDK

The RoCS JavaScript/TypeScript Client packages can be easily installed or upgraded with the following command.

```shell
npm install rocs-client
```

## Verifying the Installation

Run the following command to verify the installation:

```shell
npm list rocs-client
```

**T**he following output signifies a successful installation.

```shell
C:\Users\Fourier>npm list rocs-client
Fourier@ C:\Users\Fourier
`-- rocs-client@1.1.0
```

## Using JavaScript/TypeScript SDK

1. Import the SDK to your JavaScript/TypeScript code.

```javascript
import {Human} from 'rocs-client';   // import human class of RoCS client module
```

3. Create a robot object.

```javascript
import {Human} from 'rocs-client';  // Import Human, Car, Dog, etc

let human = new Human({host: '192.168.9.17'}); // Please replace host with the ip of your device

```

4. Control the robot.

   You can use the following methods of the `human` class to control the robot:

   * `start()`: initiates or resets control.
   * `stop()`: triggers an emergency stop (halts with power off).
   * `exit()`: ends robot control session.
   * `stand()`: commands the robot to stand in place.
   * `walk(angle, speed)`: guides the robot in movement.

     * `angle(float)`: controls direction with a range of plus or minus 45 degrees. Positive for left, negative for right. The value is an 8-digit floating-point number.
     * `speed(float)`: manages forward and backward movement with a range of plus or minus 0.8. Positive for forward, negative for backward. The value is an 8-digit floating-point number.
   * `head(roll, pitch, yaw)`: directs the GR robot's head movements.

     * `roll(float)`: controls the roll angle (rotation around the x-axis). Negative for left, positive for right, within the range of (-17.1887-17.1887).
     * `pitch(float)`: adjusts the pitch angle (rotation around the y-axis). Positive for nodding forward, negative for nodding backward, within the range of (-17.1887-17.1887).
     * `yaw(float)`: manages the yaw angle (rotation around the z-axis). Negative for turning left, positive for turning right, within the range of (-17.1887-17.1887).
   * `move_joint(*motor)`: moves joints (variable length parameter, capable of controlling multiple joints simultaneously, estimated delay 2ms).

     * `motor(Motor)`: joint object, provides joint mapping relationships and parameter numbers through `human.motor_limits`.
   * `upper_body(arm_action, hand_action)`: executes preset commands for the upper limbs.

     * `arm_action(ArmAction)`: enumeration for arm preset commands.
     * `hand_action(HandAction)`: enumeration for hand preset commands.

## Example code

Here's an example code snippet showcasing the utilization of the JavaScript/TypeScript Client SDK for robot control:

```Javascript/TypeScript
// Import Human class from the 'rocs-client' library
import {Human} from'rocs-client';  

// Create an instance of the Human class with the specified robot IP
let human = newHuman({host:'192.168.9.17'});      // Replace '192.168.9.17' with your robot's actual IP

// Enable remote control for the robot
human.start(); 

// After a brief delay, execute a sequence of actions
setTimeout(() => {
    // Make the robot stand up
    human.stand() 
    // Move the robot forward at a speed of 0.1
    human.walk(0, 0.1) 
    // Wave left hand
    human.upper_body(arm=ArmAction.LEFT_ARM_WAVE)   
    // Wave both hands
    human.upper_body(arm=ArmAction.TWO_ARMS_WAVE)   
    // Tremble the fingers
    human.upper_body(hand=HandAction.TREMBLE)   
  
    //Move motor no.1 left and right by 10 degrees each
    human.move_joint(Motor(no='1', angle=10, orientation='left'),

          Motor(no='1', angle=10, orientation='right')) 

  

    //  Control system built-in state machine to ensure the normal robot calibration and startup. It is recommended to execute subsequent commands 10 seconds after the start() command.

}, 10*1000)

```


## Release History

| Version | Released by                 | Date    | Description                                                             |
| ------- | --------------------------- | ------- | ----------------------------------------------------------------------- |
| 0.1     | Fourier Software Department | 2023.8  | 1. Project initiation<br />2. Confirm basic architecture                |
| 0.2     | Fourier Software Department | 2023.9  | 1. Control module, system module<br />2. Specific coding                |
| 1.1     | Fourier Software Department | 2023.10 | 1. Hand, head preset actions<br />2. Single joint control of upper body |
