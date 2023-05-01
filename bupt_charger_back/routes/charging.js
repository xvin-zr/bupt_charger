const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const WaitZone = require('../class/wait-zone');
const { secretKey }  = require('../config.js');
const { getUsernameFromJwt } = require('../class/token');

router.post('/request', (req, res) => {
    const { chargingMode, chargingAmount, batteryAmount } = req.body;
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader) {
        token = authHeader.split(' ')[1];
        console.log(`Received token: ${token}`);
    }

    const username = getUsernameFromJwt(token, secretKey);

    console.log(chargingMode, chargingAmount, batteryAmount);

    const waitZone = new WaitZone();
    if (waitZone.existUser(username)) {
        res.status(401).json({
            code: -1,
            message: '你已在等候区，请勿重复提交申请',
            data: {}
        })
    }

    // 记录申请信息
    const addRes = waitZone.addUserRequest(username, chargingMode, chargingAmount, batteryAmount);

    if (addRes) {
        // store success
        res.status(200).json({
            code: 0,
            message: '申请成功',
            data: {}
        });
    } else {
        // store fail
        res.status(401).json({
            code: -1,
            message: '申请失败，等候区已满',
            data: {}
        })

    }





})


module.exports = router;