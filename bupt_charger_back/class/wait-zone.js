const fs = require("fs");
const path = require('path');

const PER_WAIT_TIME = 60;

class WaitZone {
    constructor() {
        this.waitZone = [];
        // this.filePath = 'json/wait-zone.json';
        this.filePath = path.join(__dirname, '../json/wait-zone.json');
        // console.log("filePath:", this.filePath);
        this.loadWaitZone();
        // console.log(this.waitZone);
    }

    loadWaitZone() {
        try {
            const data = fs.readFileSync(this.filePath);
            this.waitZone = JSON.parse(data);
        } catch (err) {
            console.error(`Error loading wait zone: ${err}`);
        }
    }

    addUserRequest(username, chargingMode, chargingAmount, batteryAmount) {
        const prefix = chargingMode;
        let queueNumber = '';
        let maxIndex = 0;
        let emptyQueueIndex = -1;

        // 找到最大的序号和第一个空队列的位置
        for (let i = this.waitZone.length - 1; i >= 0; i--) {
            const userReq = this.waitZone[i];

            if (userReq.queueNumber === '') {
                emptyQueueIndex = i;
                // break;
            } else if (userReq.queueNumber.startsWith(prefix)) {
                const index = parseInt(userReq.queueNumber.slice(1));
                // console.log('index:', index);
                if (isNaN(index)) {
                    // emptyQueueIndex = i;
                    break;
                }
                if (index > maxIndex) {
                    maxIndex = index;
                }
            }
        }

        // 如果没有空位，返回 false
        if (emptyQueueIndex === -1 ) {
            return false;
        } else if (emptyQueueIndex !== -1) {
            maxIndex++;
            // 如果有空位，则更新空位为用户请求
            this.waitZone[emptyQueueIndex] = {
                queueNumber: prefix + maxIndex.toString(),
                userReq: {
                    username: username,
                    chargingAmount: chargingAmount,
                    batteryAmount: batteryAmount,
                    waitingTime: 0
                }
            }
        }


        // 将更新后的 waitZone 保存到 JSON 文件中
        this.saveWaitZone();
        return true;
    }

    existUser(username) {
        return !!this.waitZone.some(item => item.userReq.username === username &&
                                    item.queueNumber !== '');
    }

    getWaitingCountAhead(username) {
        const userQueueNumber = this.waitZone.find(item => item.userReq.username === username)?.queueNumber;
        if (!userQueueNumber) return 0;

        const firstLetter = userQueueNumber[0];
        const filteredQueue = this.waitZone.filter(item => item.queueNumber[0] === firstLetter);
        const count = filteredQueue.reduce((acc, item) => {
            const queueNum = parseInt(item.queueNumber.slice(1));
            const userQueueNum = parseInt(userQueueNumber.slice(1));
            if (queueNum < userQueueNum) {
                return acc + 1;
            }
            return acc;
        }, 0);

        return count;
    }

    getQueueNumber(username) {
        return this.waitZone.find(item => item.userReq.username === username)?.queueNumber;
    }


    modifyUserRequest(username, chargingMode, chargingAmount) {
        // 先判断 chargingAmount 是否大于 batteryAmount
        // 调用 addUserReq 和 clearQueueInfo
        const item = this.waitZone.find(item => item.userReq?.username === username);
        if (!item) {
            return { modifyRes: false, msg: "请稍后再试" };
        }

        const { userReq: { batteryAmount }, queueNumber } = item;
        if (chargingAmount > batteryAmount) {
            return { modifyRes: false, msg: "修改失败，申请充电量大于电池容量" };
        }

        if (chargingMode !== queueNumber[0]) {
            this.clearQueueInfo(username);
            this.addUserRequest(username, chargingMode, chargingAmount, batteryAmount);
        } else {
            item.userReq.chargingAmount = chargingAmount;
        }

        this.saveWaitZone();
        return { modifyRes: true, msg: "修改充电请求成功" };


    }

    increaseWaitingTime() {
        for (const i of this.waitZone) {
            if (i.queueNumber && i.userReq.username) {
                i.userReq.waitingTime += PER_WAIT_TIME;
            }
        }
        this.saveWaitZone();
    }

    // 找到快充和慢充排第一的用户
    getFirstUserReqs() {
        let fMinQueueNum = "";
        let tMinQueueNum = "";
        let fMinUserReq = null;
        let tMinUserReq = null;

        for (const i of this.waitZone) {
            if (i.queueNumber.startsWith("F")) {
                if (fMinQueueNum === "") {
                    fMinQueueNum = i.queueNumber;
                    fMinUserReq = i.userReq;
                } else if (i.queueNumber < fMinQueueNum) {
                    fMinQueueNum = i.queueNumber;
                    fMinUserReq = i.userReq;
                }
            } else if (i.queueNumber.startsWith("T")) {
                if (tMinQueueNum === "") {
                    tMinQueueNum = i.queueNumber;
                    tMinUserReq = i.userReq;
                } else if (i.queueNumber < tMinQueueNum) {
                    tMinQueueNum = i.queueNumber;
                    tMinUserReq = i.userReq;
                }
            }
        }

        return { fMinReq: fMinUserReq, tMinReq: tMinUserReq };

    }


    clearQueueInfo(username) {
        const index = this.waitZone.findIndex(item => item.userReq?.username === username);
        if (index !== -1) {
            const item = this.waitZone[index];
            item.queueNumber = '';
            item.userReq.username = '';
            item.userReq.chargingAmount = 0;
            item.userReq.batteryAmount = 0;
            item.userReq.waitingTime = 0;
            this.saveWaitZone();
        }
    }

    saveWaitZone() {
        try {
            const data = JSON.stringify(this.waitZone, null, 2);
            fs.writeFileSync(this.filePath, data);
        } catch (err) {
            console.error(`Error saving wait zone: ${err}`);
        }
    }
}

module.exports = WaitZone;