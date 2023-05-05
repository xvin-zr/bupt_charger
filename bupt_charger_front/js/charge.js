// 用户充电区

function getChargingQueueInfo() {
    var requestOptions = {
        method: 'GET',
        headers: {
            'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
            'Content-Type': 'application/json',
            'Authorization': preToken + localStorage.getItem('token')
        },
        redirect: 'follow'
    };

    fetch(serverURL + "/queue/info", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(result);
            const res = JSON.parse(result);
            if (res.data.curState === "WAITINGSTAGE2" ) {
                document.getElementById("chargerId").innerText = "充电桩 " + res.data.place;
                document.getElementById("chargerId").style.fontWeight = "bold";
                document.getElementById("queueInfo").innerText = "前方一人正在充电";
            } else if (res.data.curState === "CHARGING") {
                getRemainAmount();
            } else if (res.data.curState === "FAULTREQUEUE") {
                const queueInfoDiv = document.getElementById("queueInfo");
                queueInfoDiv.textContent = "充电桩故障，正在重新分配";
            }

        })
        .catch(error => console.log('error', error));
}

function getRemainAmount() {
    var requestOptions = {
        method: 'GET',
        headers: {
            'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
            'Content-Type': 'application/json',
            'Authorization': preToken + localStorage.getItem('token')
        },
        redirect: 'follow'
    };
    fetch(serverURL + "/charging/remainAmount", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(result);
            const res = JSON.parse(result);
            console.log("remainAmount", res);
            if (res.data.amount > 0) {
                document.getElementById("queueInfo").innerText = `正在充电，还剩 ${res.data.amount}KWh`;
            } else {
                finishCharging();
            }

        })
        .catch(error => console.log('error', error));
}

function finishCharging() {
    var requestOptions = {
        method: 'POST',
        headers: {
            'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
            'Content-Type': 'application/json',
            'Authorization': preToken + localStorage.getItem('token')
        },
        redirect: 'follow'
    };
    fetch(serverURL + "/charging/submit", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(result);
            const res = JSON.parse(result);
            console.log("finishCharging", res);
            if (res.code === 0) {
                if (confirm("充电完成，是否查看充电详单？")) {
                    window.location.href = "report.html";
                }
            }

        })
        .catch(error => console.log('error', error));
}

function displayImg(chargerId) {
    // 获取 URL 中的 chargerId 参数
    // const urlParams = new URLSearchParams(window.location.search);
    // const chargerId = urlParams.get("chargerId");

    // 根据 chargerId 的值选择要显示的图片
    const chargerImg = document.getElementById("chargerImg");
    // document.getElementById("chargerId").innerText = "充电桩 " + chargerId;
    // document.getElementById("chargerId").style.fontWeight = "bold";
    if (chargerId == 1 || chargerId == 2) {
        chargerImg.src = "assets/fast-charger.png";
    } else {
        chargerImg.src = "assets/slow-charger.png";
    }
}