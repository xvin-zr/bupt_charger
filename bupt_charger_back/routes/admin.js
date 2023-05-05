const express = require('express');
const router = express.Router();

router.put('/update-pile', (req, res) => {
    const { chargingPileId, status } = req.body;
    console.log("/update-pile", chargingPileId, status);
});


router.get('/query-all-piles_stat', (req, res) => {

});

router.get('/query-queue', (req, res) => {

});

router.get('/query-report', (req, res) => {

})

module.exports = router;