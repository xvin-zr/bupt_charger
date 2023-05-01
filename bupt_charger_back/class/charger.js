const fs = require("fs");
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

    }

    restartCharging() {

    }

    existChargingUser(username) {

    }

    existWaitingUser(username) {

    }

    cancelCharging() {

    }

    finishCharging() {

    }

    assignUser(chargingType, userReq) {
        const chargers = this.chargers.filter(c => c.chargerType === chargingType);

        // 查找第一个空闲位置
        const firstEmptySlot = chargers
            .map(c => c.chargerQueue[0])
            .find(slot => slot.username === "");

        if (firstEmptySlot) {
            const other = {
                remainAmount: userReq.chargingAmount,
                chargingFee: 0,
                serviceFee: 0,
                startTime: new Date().toISOString(),
            };
            Object.assign(firstEmptySlot, userReq, other);
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
                return true;
            } else {
                return false;
            }
        }
    }

    hasSlotForFastCharger() {
        // 遍历所有快充充电桩
        for (const charger of this.chargers.filter(c => c.chargerType === "F")) {
            // 检查是否有空闲队列位置
            if (charger.chargerQueue.some(q => q.username === "")) {
                return true;
            }
        }
        return false;
    }

    hasSlotForSlowCharger() {
        // 遍历所有慢充充电桩
        for (const charger of this.chargers.filter(c => c.chargerType === "T")) {
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