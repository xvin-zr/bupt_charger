const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
// const session = require('express-session');

const app = express();

const User = require('./class/user').User // import User class
const UserList = require('./class/user').UserList // import UserList class
const WaitZone = require('./class/wait-zone');
const Charger = require('./class/charger'); // import Charger class
const { PORT, HOST, secretKey } = require('./config.js');

// const secretKey = 'mysecretkey';


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// 使用 session 中间件，并设置 session 的相关配置
// app.use(session({
//     secret: 'my-secret-key', // 用于加密 session ID 的密钥
//     resave: false, // 是否在每个请求结束后都保存 session 数据
//     saveUninitialized: true, // 是否自动保存未初始化的 session
//     cookie: { secure: false } // 是否使用 HTTPS 协议传输 cookie
// }));


app.use(cors({
    origin: ['http://127.0.0.1:8080', 'http://localhost:8080']
}));

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);

    const userList = new UserList();
    const isUser = userList.login(username, password);

    if (isUser) {
        const user = {username, password};
        const token = jwt.sign(user, secretKey, { expiresIn: '1h' });


        res.status(200).json({
            code: 0,
            message: '登录成功',
            data: {
                token: token,
                is_admin: false
            }

        });
    } else if (username === 'admin' && password === 'admin'){
        const admin = {username, password};
        const token = jwt.sign(admin, secretKey, { expiresIn: '1h' });

        // app.set("username", username); // 定义全局 username 变量

        res.status(200).json({
            code: 0,
            message: '登录成功',
            data: {
                token: token,
                is_admin: true
            }

        });
    } else {

        res.status(401).json({
            code: -1,
            message: '用户名或密码错误',
            data: {}
        });
    }
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);

    const userList = new UserList();
    const user = { username, password };

    if(userList.addUser(user)) {
        res.status(200).json({
            code: 0,
            message: '注册成功',
            data: {}
        });
    } else {
        res.status(401).json({
            code: -1,
            message: '注册失败，该用户已存在',
            data: {}
        });
    }

})

app.get('/time', (req, res) => {
    const datetime = new Date().toISOString();
    const timestamp = Date.now();

    res.status(200).json({
        code: 0,
        message: '获取时间成功',
        data: {
            datetime: datetime,
            timestamp: timestamp
        }
    });
})

// 路由
const chargingRouter = require('./routes/charging');
const queueRouter = require('./routes/queue');

app.use('/charging', chargingRouter);
app.use('/queue', queueRouter);



const server =  app.listen(PORT, () => {
    console.log('服务器已启动');
    console.log();

});


// 独立运行的代码，用于实现充电桩叫号
// 判断是否有故障
// 有故障，将队列中的车取出，优先分配
// 得到等待区最前的用户
// 判断充电桩队列有位置
// 转移用户到充电桩
// 如果当前用户被叫到，/charging/remainAmount 后 restartCharging
server.on('listening', () => {
    setInterval(() => {
        const waitZone = new WaitZone();
        const chargers = new Charger();

        const shutdownRes = chargers.getShutdownChargerUsers();
        if (shutdownRes) {
            const { chargerType, user1, user2 } = shutdownRes;
            if (user1.username) {
                const assignRes =  chargers.assignUserFromShutdown(chargerType, user1);
                chargers.cancelCharging(user1.username);
            }
            if (user2.username) {
                const assignRes =  chargers.assignUserFromShutdown(chargerType, user2);
                chargers.cancelCharging(user2.username);
            }
        }


        const { fMinReq, tMinReq } = waitZone.getFirstUserReqs();
        console.log('fMinReq', fMinReq, 'tMinReq', tMinReq);

        if (chargers.hasSlotForFastCharger() && fMinReq) {
            chargers.assignUser("F", fMinReq);
            waitZone.clearQueueInfo(fMinReq.username);

        }
        if (chargers.hasSlotForSlowCharger() && tMinReq) {
            // console.log('hasAvailableSlotForSlowCharger');
            chargers.assignUser("T", tMinReq);
            waitZone.clearQueueInfo(tMinReq.username);
        }

        chargers.chargingOnce();


    }, 5 * 1000);
})

// const PORT = 3000;
// const HOST = '127.0.0.1';
//
// app.listen(PORT, HOST, () => {
//     console.log(`服务器已启动，监听端口 ${PORT}，绑定 IP 地址 ${HOST}`);
// });
// 如果您想让服务器在其他计算机上可访问，请将 IP 地址设置为本地计算机的公共 IP 地址或网络接口的 IP 地址。
// 例如 https://www.whatismyip.com/ 或 https://www.iplocation.net/. 这些网站将显示您的公共 IP 地址。