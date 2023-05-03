const fs = require("fs");
const csv = require("csv");
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');



// 峰时电费单价
const HIGH_PRICE = 1.0;

// 平时电费单价
const NORMAL_PRICE = 0.7;

// 谷时电费单价
const LOW_PRICE = 0.4;

// 服务费单价
const SERVICE_FEE_PRICE = 0.8;

class Charger {
    constructor() {

        this.filePath = 'json/charger.json';
        this.loadCharger();
    }

    chargingOnce() {
        let price = 0; // 假设每度电的价格为 1.5 元
        const currentTime = new Date(); // 获取当前时间
        const currentMinute = currentTime.getMinutes() + currentTime.getSeconds() / 60; // 将当前分钟和秒钟转换为小数
        const hour = currentMinute / 2.5; // 计算时间因子

        // 获得当前电价
        if (hour >= 10 && hour < 15 || hour >= 18 && hour < 21) {
            price = HIGH_PRICE;
        } else if (hour >= 7 && hour < 10 || hour >= 15 && hour < 18 || hour >= 21 && hour < 23) {
            price = NORMAL_PRICE;
        } else {
            price = LOW_PRICE;
        }

        for (const charger of this.chargers) {
            if (charger.status === "RUNNING") {
                const task = charger.chargerQueue[0]; // 获取队列中的第一个任务

                if (!task.username) continue;

                const actualPower = Math.min(charger.power, task.remainAmount); // 取实际用电量和剩余电量的最小值作为充电量

                const chargingFee = price * actualPower; // 根据实际用电量计算充电费用
                const serviceFee = SERVICE_FEE_PRICE * actualPower;
                task.chargingFee += chargingFee; // 更新充电费用
                task.serviceFee += serviceFee;
                charger.cumulativeChargingAmount += actualPower; // 更新充电桩的累计充电量
                // charger.cumulativeChargingTime += 60; // 更新充电桩的累计充电时间
                // 累计充电时间结束后计算
                charger.cumulativeChargingFee += chargingFee; // 更新充电桩的累计充电费用
                charger.cumulativeServiceFee += serviceFee; // 更新充电桩的累计服务费用
                charger.cumulativeFee += chargingFee + serviceFee; // 更新充电桩的累计费用


                task.remainAmount -= charger.power; // 消耗电量
                if (task.remainAmount <= 0) {
                    task.remainAmount = 0;
                    this.finishCharging(task.username); // 完成充电任务
                }

            }
        }
        this.saveCharger(); // 保存充电桩数据
    }

    getShutdownChargerUsers() {
        for (const charger of this.chargers) {
            if (charger.status === "SHUTDOWN") {
                const {chargerType, chargerQueue} = charger;
                // if (chargerQueue[0].username) {
                //     this.finishCharging(chargerQueue[0].username);
                // }
                return {chargerType: chargerType, user1: chargerQueue[0], user2: chargerQueue[1]};
            }
        }
        return null;
    }

    append2CSV(data) {
        const filePath = "json/report.csv";
        // const data = {};

        // 将新数据追加到CSV文件中
        csv.stringify([data], {header: false}, (err, output) => {
            if (err) throw err;

            // 使用追加模式打开文件以添加数据
            fs.appendFile(filePath, output, (err) => {
                if (err) throw err;
                console.log('新数据已添加到CSV文件中');
            });
        });
    }

    restartCharging() {

    }

    existChargingUser(username) {

    }

    existWaitingUser(username) {

    }

    cancelCharging(username) {
        for (const charger of this.chargers) {
            for (let task of charger.chargerQueue) {
                if (task.username === username) {
                    task.username = "";
                    task.chargingAmount = 0;
                    task.remainAmount = 0;
                    task.batteryAmount = 0;
                    task.chargingFee = 0;
                    task.serviceFee = 0;
                    task.startTime = "";
                    // console.log(`Canceled charging for user ${username}`);
                    return;
                }
            }
        }
        // console.log(`No charging task found for user ${username}`);
    }




    finishCharging(username) {
        for (const c of this.chargers) {
            const queue = c.chargerQueue;
            if (queue[0].username === username) {
                // 找到了需要完成充电的用户
                const dateObj = new Date();
                const startTime = queue[0].startTime;
                const endTime = dateObj.toISOString();
                const start = new Date(startTime);
                const end = new Date(endTime);
                const chargingTime = (end.getTime() - start.getTime()) / 1000;

                const hash = crypto.createHash('sha256').update(username).digest('hex'); // 将用户名哈希为固定长度的字符串
                const userId = uuidv4({ namespace: hash }); // 使用哈希值作为命名空间生成 UUID
                console.log("userId: " + userId);
                const data = {
                    userId: userId,
                    orderId: queue[0].username + Math.floor(Date.now() / 10000).toString(),
                    createTime: queue[0].startTime,
                    chargingPileId: c.chargingPileId,
                    volume: queue[0].chargingAmount - queue[0].remainAmount,
                    chargingTime: Math.floor(chargingTime),
                    startTime: startTime,
                    endTime: endTime,
                    chargingFee: queue[0].chargingFee,
                    serviceFee: queue[0].serviceFee,
                    totalFee: queue[0].chargingFee + queue[0].serviceFee,
                    time: Date.now().toString(),
                };
                this.append2CSV(data); // 调用append2CSV
                if (queue[1].username) {
                    // 如果queue[1]有用户，将其移到queue[0]
                    queue[0] = queue[1];
                    queue[0].startTime = new Date().toISOString();
                    queue[1] = {
                        username: "",
                        chargingAmount: 0,
                        remainAmount: 0,
                        batteryAmount: 0,
                        chargingFee: 0,
                        serviceFee: 0,
                        startTime: "",
                    };
                } else {
                    // 否则将queue[0]的数据置0
                    queue[0] = {
                        username: "",
                        chargingAmount: 0,
                        remainAmount: 0,
                        batteryAmount: 0,
                        chargingFee: 0,
                        serviceFee: 0,
                        startTime: "",
                    };
                }
                break; // 找到了用户，退出循环
            }
        }
        this.saveCharger();
    }

    assignUser(chargingType, userReq) {
        const chargers = this.chargers.filter(c => c.chargerType === chargingType &&
            c.status === "RUNNING");

        // 查找第一个空闲位置
        const firstEmptySlot = chargers
            .map(c => c.chargerQueue[0])
            .find(slot => slot.username === "");

        if (firstEmptySlot) {
            console.log("FES", firstEmptySlot);
            console.log("userreq", userReq);
            const other = {
                remainAmount: userReq.chargingAmount,
                chargingFee: 0,
                serviceFee: 0,
                startTime: new Date().toISOString(),
            };
            Object.assign(firstEmptySlot, userReq, other);
            this.saveCharger();
            return true;
        } else {
            // 找到所有第二个位置为空的charger
            const availableChargers = chargers
                .filter(c => c.chargerQueue[1].username === "")
                .map(c => ({
                    charger: c,
                    remainAmount: c.chargerQueue[0].remainAmount,
                    power: c.power,
                }));

            if (availableChargers.length > 0) {
                // 找到remainAmount/power最小的charger
                const minCharger = availableChargers.reduce((min, curr) => {
                    const currValue = curr.remainAmount / curr.power;
                    const minValue = min.remainAmount / min.power;
                    return currValue < minValue ? curr : min;
                });

                const other = {
                    remainAmount: userReq.chargingAmount,
                    chargingFee: 0,
                    serviceFee: 0,
                    startTime: "",
                };
                Object.assign(minCharger.charger.chargerQueue[1], userReq, other);
                this.saveCharger();
                return true;
            } else {
                return false;
            }
        }
    }

    assignUserFromShutdown(chargingType, userReq) {
        const chargers = this.chargers.filter(c => c.chargerType === chargingType &&
            c.status === "RUNNING");

        // 查找第一个空闲位置
        const firstEmptySlot = chargers
            .map(c => c.chargerQueue[0])
            .find(slot => slot.username === "");

        if (firstEmptySlot) {
            Object.assign(firstEmptySlot, userReq);
            this.saveCharger();
            return true;
        } else {
            // 找到所有第二个位置为空的charger
            const availableChargers = chargers
                .filter(c => c.chargerQueue[1].username === "")
                .map(c => ({
                    charger: c,
                    remainAmount: c.chargerQueue[0].remainAmount,
                    power: c.power,
                }));

            if (availableChargers.length > 0) {
                // 找到remainAmount/power最小的charger
                const minCharger = availableChargers.reduce((min, curr) => {
                    const currValue = curr.remainAmount / curr.power;
                    const minValue = min.remainAmount / min.power;
                    return currValue < minValue ? curr : min;
                });


                Object.assign(minCharger.charger.chargerQueue[1], userReq);
                this.saveCharger();
                return true;
            } else {
                return false;
            }
        }
    }

    hasSlotForFastCharger() {
        // 遍历所有快充充电桩
        for (const charger of this.chargers.filter(c => c.chargerType === "F" &&
            c.status === "RUNNING")) {
            // 检查是否有空闲队列位置
            if (charger.chargerQueue.some(q => q.username === "")) {
                return true;
            }
        }
        return false;
    }

    hasSlotForSlowCharger() {
        // 遍历所有慢充充电桩
        for (const charger of this.chargers.filter(c => c.chargerType === "T" &&
            c.status === "RUNNING")) {
            // 检查是否有空闲队列位置
            if (charger.chargerQueue.some(q => q.username === "")) {
                return true;
            }
        }
        return false;
    }

    loadCharger() {
        try {
            const data = fs.readFileSync(this.filePath);
            this.chargers = JSON.parse(data);
        } catch (err) {
            console.error(`Error loading wait zone: ${err}`);
        }
    }

    saveCharger() {
        try {
            const data = JSON.stringify(this.chargers, null, 2);
            fs.writeFileSync(this.filePath, data);
        } catch (err) {
            console.error(`Error saving wait zone: ${err}`);
        }
    }
}

module.exports = Charger;