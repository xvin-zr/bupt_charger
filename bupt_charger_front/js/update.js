// 管理员更新充电桩状态
function updateChargerStatus() {
    document.getElementById("submitBtn").addEventListener("click", function () {
        const chargingPileSelect = document.getElementById('charging-pile');
        const statusSelect = document.getElementById('status');

        const selectedChargingPileId = chargingPileSelect.options[chargingPileSelect.selectedIndex].getAttribute('charging-pile-id');
        const selectedStatus = statusSelect.options[statusSelect.selectedIndex].value;

        console.log(`Selected charging pile ID:`, selectedChargingPileId);
        console.log(`Selected status:`, selectedStatus);

        const data = {
            "chargingPileId": selectedChargingPileId,
            "status": selectedStatus
        }
        var requestOptions = {
            method: 'PUT',
            headers: {
                'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
                'Content-Type': 'application/json',
                'Authorization': preToken + localStorage.getItem('token')
            },
            body: JSON.stringify(data),
            redirect: 'follow'
        };
        fetch(serverURL + "/admin/update-pile", requestOptions)
            .then(response => response.text())
            .then(result => {
                const res = JSON.parse(result);
                console.log("res", res);
                if (selectedChargingPileId == null)
                    alert('请选择充电桩');
                else if(selectedStatus == "")
                    alert('请选择更新状态');
                else
                    alert(res.message);
            })
            .catch(error => console.log('error', error));
    });
}