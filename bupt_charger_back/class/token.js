const jwt = require('jsonwebtoken');

function getUsernameFromJwt(token, secretKey) {
    if  (token === '') return null;
    try {
        const decoded = jwt.verify(token, secretKey);
        const { username } = decoded;
        return username;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = { getUsernameFromJwt };