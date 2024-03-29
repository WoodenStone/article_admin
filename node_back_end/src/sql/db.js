const mysql = require('mysql')
const config = require('../../config').db

// sqlParams可以为[], {}, [{}, id]
exports.db = (sql, sqlParams) => {
    sqlParams = sqlParams || []
    return new Promise((resolve, reject) => {
        // 创建连接池
        const pool = mysql.createPool(config)
        pool.getConnection((err, conn) => {
            if (!err) {
                conn.query(sql, sqlParams, (e, results) => {
                    if (!e) {
                        resolve(results)
                        conn.destroy()
                    } else {
                        console.log("sql-err", e)
                        reject(e)
                    }
                })
            } else {
                console.log('connection-err', err)
            }
        })
    })
}