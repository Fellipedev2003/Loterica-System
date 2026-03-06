const { Pool } = require("pg");

const pool = new Pool ({
    user: "postgres",
    host: "localhost",
    database: "loterica_db",
    password: "21639013fvr",
    port: 5432,
});

module.exports = pool;