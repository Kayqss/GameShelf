const express = require('express');
const router = require('./router');
const cors = require('cors');
const { dbRun } = require('./utils');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('data.db');

// Cria as tabelas do banco de dados
const initDB = async () => {
    await dbRun(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            login TEXT NOT NULL,
            password TEXT NOT NULL,
            UNIQUE(login)
        );
    `);
    
    await dbRun(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            game_id TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            review TEXT NOT NULL
        );
    `);

    await dbRun(`INSERT OR IGNORE INTO users (login, password) VALUES("admin", "admin");`);
}

initDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use('/', router);
app.use((_, res, next) => {
    res.redirect('/');
    next();
});

app.listen(4000, console.log("Server running"));
