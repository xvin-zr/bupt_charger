const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const WaitZone = require('../class/wait-zone');
const Charger = require('../class/charger'); // import Charger class
const { secretKey }  = require('../config.js');
const { getUsernameFromJwt } = require('../class/token');

router.get('/info', (req, res) => {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader) {
        token = authHeader.split(' ')[1];
        // console.log(`Received token: ${token}`);
    }

    const username = getUsernameFromJwt(token, secretKey);

    // req.app.set("username", username);

    const waitZone = new WaitZone();
    const chargers = new Charger();



    if (waitZone.existUser(username)) {
        const queueLen = waitZone.getWaitingCountAhead(username);
        const chargeId = waitZone.getQueueNumber(username);
        res.status(200).json({
            "code": 0,
            "message": "success",
            "data": {
                "chargeId": chargeId,
                "queueLen": queueLen,
                "curState": "WAITINGSTAGE1",
                "place": "WAITINGPLACE"
            }
        })
    } else if (chargers.existWaitingUser(username))  {
        const chargerId = chargers.getUserChargerId(username);
        const chargerStatus = chargers.getChargerStatus(chargerId);
        let curState = "";
        if (chargerStatus === "RUNNING") {
            curState = "WAITINGSTAGE2";
        } else if (chargerStatus === "UNAVAILABLE") {
            curState = "FAULTREQUEUE";
        }
        res.status(200).json({
            "code": 0,
            "message": "success",
            "data": {
                "chargeId": "",
                "queueLen": 0,
                "curState": curState,
                "place": chargerId
            }
        });
    } else if (chargers.existChargingUser(username)) {
        const chargerId = chargers.getUserChargerId(username);
        const chargerStatus = chargers.getChargerStatus(chargerId);
        let curState = "";
        if (chargerStatus === "RUNNING") {
            curState = "CHARGING";
        } else if (chargerStatus === "UNAVAILABLE") {
            curState = "FAULTREQUEUE";
        }
        res.status(200).json({
            "code": 0,
            "message": "success",
            "data": {
                "chargeId": "",
                "queueLen": 0,
                "curState": curState,
                "place": chargerId
            }
        });
    }
    else {
        res.status(200).json({
            "code": 0,
            "message": "用户未申请充电或已结束",
            "data": {
                "chargeId": "",
                "queueLen": 0,
                "curState": "NOTCHARGING",
                "place": ""
            }
        })
    }
})



router.post('/change', (req, res) => {
    const authHeader = req.headers.authorization;
    const { chargingMode, chargingAmount } = req.body;
    console.log("/change", chargingMode, chargingAmount);

    let token = '';
    if (authHeader) {
        token = authHeader.split(' ')[1];
        // console.log(`Received token: ${token}`);
    }

    const username = getUsernameFromJwt(token, secretKey);
    console.log("/change", username);

    const waitZone = new WaitZone();
    const chargers = new Charger();

    if (chargers.existWaitingUser(username) || chargers.existChargingUser(username)) {
        res.status(200).json({
            code: 0,
            message: "用户位于充电桩处，无法修改请求",
            data: {}
        });
        return;
    }

    const { modifyRes, msg } = waitZone.modifyUserRequest(username, chargingMode, chargingAmount);
    if (modifyRes) {
        res.status(200).json({
            code: 0,
            message: msg,
            data: {}
        });
    } else {
        res.status(401).json({
            code: -1,
            message: msg,
            data: {}
        });
    }

})

module.exports = router;