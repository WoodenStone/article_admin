const jwt = require("jsonwebtoken")
const { signKey, expiresIn } = require('../../config').server.jwt

exports.setToken = async (username) => {
    return new Promise((resolve, reject) => {
        const token = jwt.sign({
            username,
            site: 'article_admin'
        }, signKey, {
            expiresIn: expiresIn
        })
        resolve(token)
    })
}

exports.verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, signKey, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
