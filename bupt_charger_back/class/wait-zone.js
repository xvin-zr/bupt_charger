const fs = require("fs");

class WaitZone {
    constructor() {
        this.waitZone = [];
        this.filePath = 'json/wait-zone.json';
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
                    batteryAmount: batteryAmount
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

    // todo: 修改充电请求
    modifyUserRequest(username, chargingMode, chargingAmount) {
        // 调用 addUserRer 和 clearQueueInfo
        return true;

    }


    clearQueueInfo(queueNumber) {
        for (let i = 0; i < this.waitZone.length; i++) {
            const userReq = this.waitZone[i];

            if (userReq.queueNumber === queueNumber) {
                this.waitZone[i].queueNumber = '';
                this.waitZone[i].userReq.username = '';
                this.waitZone[i].userReq.chargingAmount = 0;
                this.waitZone[i].userReq.batteryAmount = 0;
                break;
            }
        }

        this.saveWaitZone();
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