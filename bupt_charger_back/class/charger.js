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