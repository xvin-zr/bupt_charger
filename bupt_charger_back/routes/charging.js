const express = require('express');
const router = express.Router();

router.post('/request', (req, res) => {
    // 记录申请信息

    // store success
    res.status(200).json({
        code: 0,
        message: '申请成功',
        data: {}
    })

    // store fail

})


module.exports = router;