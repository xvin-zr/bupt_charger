const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

const User = require('./class/user').User // import User class
const UserList = require('./class/user').UserList // import UserList class
const { PORT, HOST, secretKey } = require('./config.js');

// const secretKey = 'mysecretkey';

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/charging', chargingRouter);



app.listen(PORT, () => {
    console.log('服务器已启动');
    console.log();
});

// const PORT = 3000;
// const HOST = '127.0.0.1';
//
// app.listen(PORT, HOST, () => {
//     console.log(`服务器已启动，监听端口 ${PORT}，绑定 IP 地址 ${HOST}`);
// });
// 如果您想让服务器在其他计算机上可访问，请将 IP 地址设置为本地计算机的公共 IP 地址或网络接口的 IP 地址。
// 例如 https://www.whatismyip.com/ 或 https://www.iplocation.net/. 这些网站将显示您的公共 IP 地址。