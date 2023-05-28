// 管理员查看排队情况

function getQueueStatus() {
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

        fetch(serverURL + "/admin/query-queue", requestOptions)
            .then(response => response.text())
            .then(result => {
                const res = JSON.parse(result);
                console.log("res", res);

                // 获取表格的 tbody 元素
                const tbody = document.getElementById('table-body');

                // 清空表格
                tbody.innerHTML = "";
                
                if (res.data.length != 0) {
                     // 遍历 'data' 数组中的每个 JSON 数据对象
                    res.data.forEach(dataObj => {
                        // 创建一个新的表格行
                        const row = tbody.insertRow();

                        // 创建表格单元格并将数据添加到单元格中
                        const chargingPileIdCell = row.insertCell();
                        chargingPileIdCell.innerHTML = dataObj.chargingPileId;

                        const usernameCell = row.insertCell();
                        usernameCell.innerHTML = dataObj.username;

                        const requireAmountCell = row.insertCell();
                        requireAmountCell.innerHTML = dataObj.requireAmount;

                        const batteryAmountCell = row.insertCell();
                        batteryAmountCell.innerHTML = dataObj.batteryAmount;

                        const waitingTimeCell = row.insertCell();
                        waitingTimeCell.innerHTML = dataObj.waitingTime;
                    })
                }
                else {

                    // 创建一个新的表格行
                    const row = tbody.insertRow();
                    
                    const info = row.insertCell();
                    info.innerHTML = "暂无用户";

                    // 将第一行的五个单元格合并
                    info.colSpan = 5;
                    
                }
            }).catch(error => console.log('error', error));
    })
}