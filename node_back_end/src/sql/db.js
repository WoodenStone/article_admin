const mysql = require('mysql');

// database数据库名
const config = {
    database: 'ArticleAdmin',
    user: 'root',
    password: '123456'
}

// sqlParams可以为[], {}, [{}, id]
exports.db = (sql, sqlParams) => {
    sqlParams = sqlParams || [];
    return new Promise((resolve, reject) => {
        // 创建连接池
        const pool = mysql.createPool(config);
        pool.getConnection((err, conn) => {
            if(!err) {
                conn.query(sql, sqlParams, (e, results) => {
                    if(!e) {
                        console.log(results);
                        resolve(results);
                        conn.destroy();
                    } else {
                        console.log("sql-err", e);
                        reject(e);
                    }
                })
            } else  {
                console.log('connection-err', err);
            }
        })
    })
}