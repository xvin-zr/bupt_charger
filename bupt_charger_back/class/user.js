const fs = require("fs")
const path = require("path");
const csv = require("csv");

class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        // this.licensePlate = licensePlate;
        // this.batteryCapacity = batteryCapacity;
    }
}

class UserList {
    constructor() {
        this.users = [];
        // this.filePath = 'json/users.json';
        this.filePath = path.join(__dirname, '../json/users.json');
        this.loadUsers();
    }

    addUser(user) {
        // 检查是否存在相同的用户名
        const existingUser = this.users.find(u => u.username === user.username);
        if (existingUser || user.username === 'admin') {
            // console.log(`User with username ${user.username} already exists`);
            return false ;
        }
        // 添加新用户
        this.users.push(user);
        this.saveUsers();
        return true;
    }

    loadUsers() {
        try {
            const data = fs.readFileSync(this.filePath);
            const users = JSON.parse(data);
            this.users = users.map(u => new User(u.username, u.password));
        } catch (err) {
            console.error(`Error loading users: ${err}`);
        }
    }

    saveUsers() {
        try {
            const data = JSON.stringify(this.users, null, 2);
            fs.writeFileSync(this.filePath, data);
        } catch (err) {
            console.error(`Error saving users: ${err}`);
        }
    }

    login(username, password) {
        return this.users.find(u => u.username === username && u.password === password);
    }

    getCsvData(username) {
        const filePath = path.join(__dirname, "../json/report.csv");
        const data = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv.parse({ columns: true }))
                .on("data", (row) => {
                    if (row.username === username) {
                        data.push({
                            userId: row.userId,
                            username: row.username,
                            orderId: row.orderId,
                            createTime: row.createTime,
                            chargingPileId: row.chargingPileId,
                            volume: parseFloat(row.volume),
                            chargingTime: parseFloat(row.chargingTime) * 3600,
                            startTime: row.startTime,
                            endTime: row.endTime,
                            chargingFee: parseFloat(row.chargingFee),
                            serviceFee: parseFloat(row.serviceFee),
                            totalFee: parseFloat(row.totalFee),
                            time: row.time,
                        });
                    }
                })
                .on("end", () => {
                    const result = data.reverse().slice(0, 5);
                    resolve(result);
                })
                .on("error", (error) => {
                    reject(error);
                });
        });

    }
}


module.exports = {User, UserList}