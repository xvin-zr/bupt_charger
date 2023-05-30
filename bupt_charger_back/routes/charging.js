const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const WaitZone = require('../class/wait-zone');
const Charger = require('../class/charger'); // import Charger class
const { secretKey }  = require('../config.js');
const { getUsernameFromJwt } = require('../class/token');
const {User, UserList} = require("../class/user");

router.post('/request', (req, res) => {
    const { chargingMode, chargingAmount, batteryAmount } = req.body;
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader) {
        token = authHeader.split(' ')[1];
        // console.log(`Received token: ${token}`);
    }

    const username = getUsernameFromJwt(token, secretKey);

    console.log(chargingMode, chargingAmount, batteryAmount);

    const waitZone = new WaitZone();
    if (waitZone.existUser(username)) {
        res.status(401).json({
            code: -1,
            message: '你已在等候区，请勿重复提交申请',
            data: {}
        });
        return;
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

router.get("/remainAmount", (req, res) => {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader) {
        token = authHeader.split(' ')[1];
        // console.log(`Received token: ${token}`);
    }
    const username = getUsernameFromJwt(token, secretKey);

    const chargers = new Charger();
    const remainAmount = chargers.getUserRemainAmount(username);
    console.log("remainAmount", remainAmount);

    res.status(200).json({
        code: 0,
        message: 'success',
        data: {
            amount: remainAmount
        }
    })
})

router.post("/submit", (req, res) => {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader) {
        token = authHeader.split(' ')[1];
        // console.log(`Received token: ${token}`);
    }
    const username = getUsernameFromJwt(token, secretKey);

    const chargers = new Charger();

    const data = chargers.finishCharging(username);

    res.status(200).json({
        code: 0,
        message: '成功',
        data: data
    })
})

router.post("/cancel", (req, res) => {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader) {
        token = authHeader.split(' ')[1];
        // console.log(`Received token: ${token}`);
    }
    const username = getUsernameFromJwt(token, secretKey);
    console.log("/cancel", username);

    const waitZone = new WaitZone();
    const chargers = new Charger();

    if (waitZone.existUser(username)) {
        // todo: 等待区中用户取消充电
        waitZone.clearQueueInfo(username);

        res.status(200).json({
            code: 0,
            message: '取消充电成功',
            data: {}
        });

    } else if (chargers.existWaitingUser(username)) {
        chargers.cancelCharging(username);
        res.status(200).json({
            code: 0,
            message: '取消充电成功',
            data: {}
        });

    } else if (chargers.existChargingUser(username)) {
        chargers.finishCharging(username);
        res.status(200).json({
            code: 0,
            message: '取消充电成功',
            data: {}
        });
    }
})


router.get('/report', reportHandler);


function reportHandler(req, res) {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader) {
        token = authHeader.split(' ')[1];
        // console.log(`Received token: ${token}`);
    }
    const username = getUsernameFromJwt(token, secretKey);

    const userList = new UserList();

    userList.getCsvData(username)
        .then((result) => {
            res.status(200).json({
                code: 0,
                message: '查看充电数据成功',
                data: result
            });
        })
        .catch((error) => {
            console.error(error)
            res.status(401).json({
                code: -1,
                message: '查看充电数据失败',
                data: []
            });
        });
}


module.exports = router;
module.exports.reportHandler = reportHandler;