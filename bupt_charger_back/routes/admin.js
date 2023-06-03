const express = require('express');
const router = express.Router();

const WaitZone = require('../class/wait-zone');
const Charger = require('../class/charger');
const {data} = require("express-session/session/cookie"); // import Charger class

// 管理员更新充电桩状态
router.put('/update-pile', (req, res) => {
    const { chargingPileId, status } = req.body;
    console.log("/update-pile", chargingPileId, status);

    const chargers = new Charger();
    if (chargingPileId != null && status !== ""){
        // 若充电桩正在被使用则提示用户稍后再试
        for (const charger of chargers.chargers) {
            if (charger.chargingPileId === chargingPileId && status === "SHUTDOWN" && (charger.chargerQueue[0].username !== "" || charger.chargerQueue[1].username !== "")) {
                res.status(200).json({
                    code: 0,
                    message: '该充电桩正在使用，请稍后再试',
                    data: {}
                })
                return;
            } else if (charger.chargingPileId === chargingPileId && charger.status === "UNAVAILABLE") {
                res.status(200).json({
                    code: 0,
                    message: '该充电桩故障，请稍后再试',
                    data: {}
                })
                return;
            }
        }

        chargers.updateChargerStatus(chargingPileId, status)
        .then(data => {
            res.status(200).json({
                code: 0,
                message: '更新成功',
                data: data
            })
        })
        .catch(error => {
            console.log(error)
            res.status(401).json({
                code: -1,
                message: 'error',
                data: {}
            })
        })
    }
    else
        res.status(200).json({
            code: 0,
            message: '更新失败',
            data: {}
        })

});


router.get('/query-all-piles_stat', (req, res) => {
    const chargers = new Charger();

    chargers.getAllChargerStatus()
        .then(data => {
            res.status(200).json({
                code: 0,
                message: '查询成功',
                data: data
            })
        })
        .catch(error => {
            console.log(error)
            res.status(401).json({
                code: -1,
                message: 'error',
                data: []
            })

        })
});

// 管理员查看排队状态
router.get('/query-queue', (req, res) => {
    /*
    const data = [
        {
            chargingPileId: "A",
            username: "qwerty",
            requireAmount: 60.00,
            batteryAmount: 90.00,
            waitingTime: 600
        }
    ]
    res.status(200).json({
        code: 0,
        message: 'success',
        data: data
    })
    */

    const waitZone = new WaitZone();

    waitZone.getWaitingStatus()
        .then(data => {
            res.status(200).json({
                code: 0,
                message: '查询成功',
                data: data
            })
        })
        .catch(error => {
            console.log(error)
            res.status(401).json({
                code: -1,
                message: 'error',
                data: []
            })
        })
});

router.get('/query-report', (req, res) => {
    const chargers = new Charger();

    chargers.getChargerReport()
        .then(data => {
            res.status(200).json({
                code: 0,
                message: "查看成功",
                data: data
            })
        })
        .catch(error => {
            console.log(error);
            res.status(401).json({
                code: -1,
                message: 'error',
                data: []
            })
        })
})

module.exports = router;