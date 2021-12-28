const jwt = require("jsonwebtoken")
const signKey = 'ewfes_fvsdas_wfyhs_kder'
const JWT_EXPIRES = 60 * 60 * 24 * 7

exports.setToken = (username) => {
    return new Promise((resolve, reject) => {
        const token = jwt.sign({
            username,
            site: 'article_admin'
        }, signKey, {
            expiresIn: JWT_EXPIRES
        })
        resolve(token)
    })
}

exports.verToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, signKey, (err, res) => {
            if(err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
