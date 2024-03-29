// 用户查看充电详单

function getReport(id) {
    var requestOptions = {
        method: 'GET',
        headers: {
            'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
            'Content-Type': 'application/json',
            'Authorization': preToken + localStorage.getItem('token')
        },
        redirect: 'follow'
    };

    fetch(serverURL + "/report/charging", requestOptions)
        .then(response => response.text())
        .then(result => {
            const res = JSON.parse(result);
            console.log("report", res);
            const tableBody = document.getElementById("table-body");
            for (let i = 0; i < res.data.length; i++) {
                const row = document.createElement("tr");
                const order = res.data[i];
                console.log("order", order);
                row.innerHTML = `
                  <td class="table-cell">${order.orderId}</td>
                  <td class="table-cell">${new Date(order.createTime).toLocaleString("zh-CN", { hour12: false })}</td>
                  <td class="table-cell">${order.chargingPileId}</td>
                  <td class="table-cell">${(order.volume).toFixed(2)}</td>
                  <td class="table-cell">${(order.chargingTime).toFixed(2)}</td>
                  <td class="table-cell">${new Date(order.startTime).toLocaleString("zh-CN", { hour12: false })}</td>
                  <td class="table-cell">${new Date(order.endTime).toLocaleString("zh-CN", { hour12: false })}</td>
                  <td class="table-cell">${(order.chargingFee).toFixed(2)}</td>
                  <td class="table-cell">${(order.serviceFee).toFixed(2)}</td>
                  <td class="table-cell">${(order.totalFee).toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
              }
        })
        .catch(error => console.log('error', error));
}