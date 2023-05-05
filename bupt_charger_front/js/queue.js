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
            })
            .catch(error => console.log('error', error));
    });
}