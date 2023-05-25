const express = require('express');
const router = express.Router();

const WaitZone = require('../class/wait-zone');
const Charger = require('../class/charger');
const {data} = require("express-session/session/cookie"); // import Charger class

// 管理员更新充电桩状态
router.put('/update-pile', (req, res) => {
    const { chargingPileId, status } = req.body;
    console.log("/update-pile", chargingPileId, status);
});


router.get('/query-all-piles_stat', (req, res) => {
    const chargers = new Charger();

    chargers.getAllChargerStatus()
        .then(data => {
            res.status(200).json({
                code: 0,
                message: 'success',
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
});

router.get('/query-report', (req, res) => {
    const data = [
        {
            day: 28,
            week: 3,
            month: 2,
            chargingPileId: "A",
            cumulativeUsageTimes: 53,
            cumulativeChargingTime: 123,
            cumulativeChargingAmount: 2191.32,
            cumulativeChargingFee: 123.12,
            cumulativeServiceFee: 321.12,
            cumulativeFee: 666.66
        }
    ]

    res.status(200).json({
        code: 0,
        message: 'success',
        data: data
    })
})

module.exports = router;