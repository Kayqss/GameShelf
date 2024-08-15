const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db');

const dbQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

const dbRun = (query, params) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

const getGameData = async (id) => {
    const data = await(await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&l=br`, {
        headers: {
            "Accept-Language": "pt-BR,en-GB,en;q=0.5"
        }
    })).json();
    return data[id].data;
}

const searchGame = async (query) => {
    const data = await(await fetch(`https://store.steampowered.com/api/storesearch?term=${query}&l=portuguese&cc=BR`)).json();
    return data.items;
}

module.exports = {
    dbQuery,
    dbRun,
    searchGame,
    getGameData
}
