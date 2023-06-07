

// const serverURL = require('../config.js').serverURL;
// const PER_HOUR = 60 / 24;
const PER_HOUR = 1;

function getTimeFromServer() {
    var myHeaders = new Headers();
    myHeaders.append("User-Agent", "Apifox/1.0.0 (https://www.apifox.cn)");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    // 获取页面中的<div id="time"></div>元素
    var timeDiv = document.getElementById("time");

    fetch(serverURL + "/time", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log('result\n', result);
            // 在控制台中输出时间
            const res = JSON.parse(result);
            console.log(res);

            if (res.code === 0) {
                // const datetime = timeToDecimal(res.data.datetime);
                // const hour = Math.floor(datetime / PER_HOUR);
                const date = new Date(res.data.datetime);
                const hour = date.getHours() - 8;
                const minutes = date.getMinutes();
                let mid = ":";
                if (minutes < 10) {
                    mid = ":0";
                }
                // 将内容修改为"Hour: hour"
                // timeDiv.innerHTML = hour + ":00";
                timeDiv.innerHTML = hour + mid + minutes;

            }
        })
        .catch(error => console.log('error', error));
}

// 每分钟调用getTimeFromServer()函数
function callGetTimeFromServer() {
    setInterval(function () {
        getTimeFromServer();
    }, 1 * 1000); // 每60秒调用一次函数
}

function timeToDecimal(timeString) {
    const date = new Date(timeString);
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const decimal = minutes + seconds / 60;
    return decimal.toFixed(2);
}

