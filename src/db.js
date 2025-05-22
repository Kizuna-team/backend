const { Pool } = require("pg");

const pool  = new Pool({
    user: 'kizuna_user',
    host: 'localhost',
    database: 'kizuna_database',
    password: '1234',
    port: '5432'
});

// 確認是否連線成功
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('資料庫連線失敗', err);
    } else {
        console.log('資料庫連線成功', res.rows);
    }
});

module.exports = pool;