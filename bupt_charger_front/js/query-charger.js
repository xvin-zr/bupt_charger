// 管理员查看充电桩状态

function getChargerStatus() {
    document.getElementById("submitBtn").addEventListener("click", function () {
        var requestOptions = {
            method: 'GET',
            headers: {
                'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
                'Content-Type': 'application/json',
                'Authorization': preToken + localStorage.getItem('token')
            },
            redirect: 'follow'
        };
    
        fetch(serverURL + "/admin/query-all-piles_stat", requestOptions)
            .then(response => response.text())
            .then(result => {
                const res = JSON.parse(result);
                console.log("res", res);

                
    
                // 获取表格的 tbody 元素
                const tbody = document.getElementById('table-body');
    
                // 清空表格
                tbody.innerHTML = "";
                // 遍历 'data' 数组中的每个 JSON 数据对象
                res.data.forEach(dataObj => {
                    // 创建一个新的表格行
                    const row = tbody.insertRow();
    
                    // 创建表格单元格并将数据添加到单元格中
                    const chargingPileIdCell = row.insertCell();
                    chargingPileIdCell.innerHTML = dataObj.chargingPileId;
    
                    const statusCell = row.insertCell();
                    statusCell.innerHTML = dataObj.status;
    
                    const cumulativeUsageTimesCell = row.insertCell();
                    cumulativeUsageTimesCell.innerHTML = dataObj.cumulativeUsageTimes;
    
                    const cumulativeChargingTimeCell = row.insertCell();
                    cumulativeChargingTimeCell.innerHTML = dataObj.cumulativeChargingTime;
    
                    const cumulativeChargingAmountCell = row.insertCell();
                    cumulativeChargingAmountCell.innerHTML = dataObj.cumulativeChargingAmount;
                    
                });
                alert(res.message);
            })
            .catch(error => console.log('error', error));
    });
}