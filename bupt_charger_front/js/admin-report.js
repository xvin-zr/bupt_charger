// 管理员查看报表

function getReport() {
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

        fetch(serverURL + "/admin/query-report", requestOptions)
            .then(response => response.text())
            .then(result => {
                const res = JSON.parse(result);
                console.log("res", res);

                

                const tbody = document.getElementById('table-body');
    
                // 清空表格
                tbody.innerHTML = "";
                res.data.forEach(dataObj => {
                    // 创建一个新的表格行
                    const row = tbody.insertRow();
                  
                    // 创建表格单元格并将数据添加到单元格中
                    const dayCell = row.insertCell();
                    dayCell.innerHTML = dataObj.day;
                  
                    const weekCell = row.insertCell();
                    weekCell.innerHTML = dataObj.week;
                  
                    const monthCell = row.insertCell();
                    monthCell.innerHTML = dataObj.month;
                  
                    const chargingPileIdCell = row.insertCell();
                    chargingPileIdCell.innerHTML = dataObj.chargingPileId;
                  
                    const cumulativeUsageTimesCell = row.insertCell();
                    cumulativeUsageTimesCell.innerHTML = dataObj.cumulativeUsageTimes;
                  
                    const cumulativeChargingTimeCell = row.insertCell();
                    cumulativeChargingTimeCell.innerHTML = dataObj.cumulativeChargingTime;
                  
                    const cumulativeChargingAmountCell = row.insertCell();
                    cumulativeChargingAmountCell.innerHTML = dataObj.cumulativeChargingAmount;
                  
                    const cumulativeChargingFeeCell = row.insertCell();
                    cumulativeChargingFeeCell.innerHTML = dataObj.cumulativeChargingFee.toFixed(2);
                  
                    const cumulativeServiceFeeCell = row.insertCell();
                    cumulativeServiceFeeCell.innerHTML = dataObj.cumulativeServiceFee.toFixed(2);
                  
                    const cumulativeFeeCell = row.insertCell();
                    cumulativeFeeCell.innerHTML = dataObj.cumulativeFee.toFixed(2);
                  });

                alert(res.message)

            })
            .catch(error => console.log('error', error));
    });
}