
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
            document.getElementById("queueNumber").innerText = res.data.chargeId;
            document.getElementById("count").innerText = res.data.queueLen;
        })
        .catch(error => console.log('error', error));
}