const express = require('express');
const router = express.Router();

const WaitZone = require('../class/wait-zone');

router.post('/request', (req, res) => {
    const { chargingMode, chargingAmount, batteryAmount } = req.body;
    console.log(chargingMode, chargingAmount, batteryAmount);
    // 记录申请信息
    const waitZone = new WaitZone();
    const addRes = waitZone.addUserRequest(chargingMode, chargingAmount, batteryAmount);

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