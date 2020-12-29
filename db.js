const sqlite3 = require('sqlite3').verbose();

const tables = {
    videos: `CREATE TABLE videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        youtubeId TEXT,
        title TEXT NOT NULL,
        description TEXT,
        uploadDate INTEGER,
        user_id INTEGER)`,
    users: `CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )`,
    sessions: `CREATE TABLE sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        active BOOLEAN NOT NULL DEFAULT 1
    )`
};

const initData = {
    videos: {
        sql: 'INSERT INTO videos (id, user_id, youtubeId, title, description, uploadDate) VALUES (?, ?, ?, ?, ?, ?)',
        data: [{
            id: 1,
            user_id: 1,
            youtubeId: 'dQw4w9WgXcQ',
            title: 'First video!!',
            description: 'abcd!! this is the first video in the platform!! gonna be rich',
            uploadDate: 1,
        }, {
            id: 2,
            user_id: 2,
            youtubeId: 'dQw4w9WgXcQ',
            title: 'funny video please watch!',
            description: 'haha funny :))))) please rate and subscribe',
            uploadDate: 1
        }, {
            id: 3,
            user_id: 1,
            youtubeId: 'CnUJUMpq48E',
            title: 'DJ IBUSAL - PILALLA',
            description: 'kaik on pilalla',
            uploadDate: 1,
        }, {
            id: 4,
            user_id: 2,
            youtubeId: 'LDU_Txk06tM',
            title: 'crab rave',
            description: 'haha',
            uploadDate: 1,
        }, {
            id: 5,
            user_id: 1,
            youtubeId: 'CnUJUMpq48E',
            title: 'please delete me',
            description: 'delete',
            uploadDate: 1609185734197,
        }]
    },
    users: {
        sql: 'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
        data: [{
            id: 1,
            username: 'admin',
            password: 'admin',
        }, {
            id: 2,
            username: 'user123',
            password: 'PaSSworDD!!',
        }],
    },
    sessions: {
        sql: 'INSERT INTO sessions (id, user_id) VALUES (?, ?)',
        data: [{
            id: 1,
            user_id: 1,
        }]
    }
}

const db = new sqlite3.Database('db.dat', err => {
    if (err) {
        console.log(err);
        throw err;
    } else {
        console.log('Connected to database');

        // Create tables
        Object.keys(tables).forEach(table => {
            let tableSql = tables[table];
            let exists = false;

            db.run(tableSql, err => {
                if (!err) {
                    // Table didn't exist before
                    console.log(`Created database table ${table}`);

                    if (initData[table]) {
                        console.log(`Populating table ${table} with initial data (${initData[table]['data'].length} rows)`);
        
                        initData[table]['data'].forEach(row => {
                            let rowData = Object.keys(row).map(key => row[key]);
                            db.run(initData[table]['sql'], rowData, (err) => {
                                if (err)
                                    console.log(err);
                            });
                        });
                    }
                }
            });
        });
    }
})

module.exports = db;