<p align="center">
    <a href="https://fftai.github.io" target="_blank" rel="noopener noreferrer">
        <img width="200" src="https://raw.githubusercontent.com/FFTAI/rocs_server/main/assets/ico.jpg" alt="logo">
    </a>
</p>

# RoCS-Client SDK (Javascript/Typescript)

## Overview

This example (RoCS Client SDK) is suitable for you already have a robot device provided by Fourier!
This example can be used to control the robot. It provides a set of simple APIs that allow you to easily interact with
the robot.

## Installation

```shell
npm install rocs-client
```

## Function introduction

You can use the following methods to control the robot:

- start(): Zero/Start control
- stop(): Emergency stop (will stop with power off)
- exit(): Exit robot control
- stand(): Stand in place
- walk(angle, speed): Control the robot to move, walk
    - angle(float): Angle controls direction, range is plus or minus 45 degrees. Left is positive, right is negative! (
      Floating point number with 8 digits)
    - speed(float): Speed controls forward and backward, range is plus or minus 0.8. Forward is positive, backward is
      negative! (Floating point number with 8 digits)
- head(roll, pitch, yaw): Control GR-01 humanoid head movement
    - roll(float): roll (roll angle): describes the angle of rotation around the x-axis, left turn head is negative,
      right turn is positive, range (-17.1887-17.1887)
    - pitch(float): pitch (pitch angle): describes the angle of rotation around the y-axis. Nodding forward is positive,
      nodding backward is negative, range (-17.1887-17.1887)
    - yaw(float): yaw (yaw angle): describes the angle of rotation around the z-axis. Turning left head is negative,
      turning right head is positive, range (-17.1887-17.1887)
    - motor(Motor): Joint object, can get corresponding joint mapping relationship and parameter number through
      human.motor_limits
- upper_body(arm_action, hand_action): Upper limb preset command
    - arm_action(ArmAction): Arm preset command enumeration
    - hand_action(HandAction): Hand preset command enumeration


## Usage

#### import sdk
First you need to import the SDK into your code

```javascript
import {Human} from 'rocs-client';   
```

#### Create a robot object

Then, you need to create a robot object in order to use this SDK
```javascript
import {Human} from 'rocs-client';  // Import Human, Car, Dog, etc

let human = new Human({host: '192.168.9.17'}); // Please replace host with the ip of your device
```

#### Sample code
Here is a complete example code that demonstrates how to use this SDK to control the robot:

```javascript
import {Human} from 'rocs-client';

let human = new Human({host: '192.168.9.17'});      // Replace host with the ip of the device you own

human.start(); // Enable remote control

setTimeout(() => {
    human.stand() // Stand up
    human.walk(0, 0.1) // Move forward at a speed of 0.1

    human.upper_body(arm = ArmAction.LEFT_ARM_WAVE)       // Wave left hand
    human.upper_body(arm = ArmAction.TWO_ARMS_WAVE)       // Wave hands
    human.upper_body(hand = HandAction.TREMBLE)           // Tremble fingers

    human.move_joint(Motor(no = '1', angle = 10, orientation = 'left'),
        Motor(no = '1', angle = 10, orientation = 'right')) // Move motor no.1 left and right by 10 degrees each

    //  Control system built-in state machine. In order to ensure the normal calibration and startup of the robot, it is recommended to execute subsequent commands 10 seconds after the start() command
}, 10 * 1000)
```

## Journey

| Version | Author                      | Date    | Description                                                        | Quick Preview                                                |
|---------|-----------------------------|---------|--------------------------------------------------------------------|--------------------------------------------------------------|
| 0.1     | Fourier Software Department | 2023.8  | 1. Project initiation<br/>2. Confirm basic architecture            | [0.1 Description](https://fftai.github.io/release/v0.1.html) |
| 0.2     | Fourier Software Department | 2023.9  | 1. Control module, system module<br/>2. Specific coding            | [0.2 Description](https://fftai.github.io/release/v0.2.html) |
| 1.1     | Fourier Software Department | 2023.10 | 1. Hand, head preset actions<br/>2. Single joint control of upper body | [1.1 Description](https://fftai.github.io/release/v1.1.html) |
