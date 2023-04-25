class Charger {
    constructor(chargingPileId, status,
                cumulativeUsageTimes, cumulativeChargingTime, cumulativeChargingAmount) {
        this.chargingPileId = chargingPileId;
        this.status = status;
        this.cumulativeUsageTimes = cumulativeUsageTimes;
        this.cumulativeChargingTime = cumulativeChargingTime;
        this.cumulativeChargingAmount = cumulativeChargingAmount;
    }
}