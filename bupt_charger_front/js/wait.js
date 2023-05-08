// 用户等待区
function getQueueInfo() {
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
            if (res.data.curState === "WAITINGSTAGE2" || res.data.curState === "CHARGING") {
                alert(`请前往充电桩 ${res.data.place}`);
                window.location.href = "charging.html?chargerId=" + res.data.place;
            } else if (res.data.curState === "FAULTREQUEUE") {
                const queueInfoDiv = document.getElementById("queueInfo");
                queueInfoDiv.textContent = "充电桩故障，正在重新分配";
            } else if (res.code === -1) {
                alert(res.message);
                window.history.back();
            }
            document.getElementById("queueNumber").innerText = res.data.chargeId;
            document.getElementById("count").innerText = res.data.queueLen;
        })
        .catch(error => console.log('error', error));
}

function cancelQueue() {
    document.getElementById("cancelBtn").addEventListener("click", function () {
        var requestOptions = {
            method: 'POST',
            headers: {
                'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
                'Content-Type': 'application/json',
                'Authorization': preToken + localStorage.getItem('token')
            },
            redirect: 'follow'
        };

        fetch(serverURL+"/charging/cancel", requestOptions)
            .then(response => response.text())
            .then(result => {
                const res = JSON.parse(result);
                console.log("res", res);
                alert(res.message);
                if (res.code === 0) {
                    window.location.href = "apply.html";
                }
            })
            .catch(error => console.log('error', error));
    });
}