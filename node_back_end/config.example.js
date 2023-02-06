module.exports = {
    db: {
        /***
         * 数据库名
         */
        database: 'yourdatabasename',
        /**
         * 数据库用户名
         */
        user: 'databaseusername',
        /**
         * 数据库密码
         */
        password: '******'
    },
    server: {
        /**
         * 服务器监听端口
         */
        port: 3001,
        /**
         * 上传文件地址
         */
        uploadDst: 'http://127.0.0.1:3001/',
        /**
         * jwt 相关配置
         */
        jwt: {
            signKey: 'somekey',
            expiresIn: 60 * 60 * 24 * 7
        }
    },
}