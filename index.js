const express = require('express');
const app = express();
const port = 3000;

//ORM Import
const {Sequelize} = require('sequelize');
const orm = new Sequelize({
    dialect:'sqlite',
    storage: './db/plants.db'
})

require('./models/plants')(orm);

orm.sync().then(
    
);


const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database('./db/plants.db', (err) => {
    if (err) {
        console.log("Database error: ", err);
    }
});
const dbDefault = require("./defaultDatabase.json");

refreshDatabase = () => {
    db.serialize(() => {
        for (const [key, value] of Object.entries(dbDefault.tables)) {
            db.run(`DROP TABLE IF EXISTS ${key}`, (err) => {
                if (err) {
                    console.log("Error while dropping Tables", err);
                }
            });
        }
    })
    db.serialize(() => {
        for (const [key, value] of Object.entries(dbDefault.tables)) {
            if (value.schema) {
                //Generate Table
                let tableQuery = `CREATE TABLE IF NOT EXISTS ${key}(`;
                for (const [schema_key, schema_value] of Object.entries(value.schema)) {
                    tableQuery += `${schema_key} ${schema_value},`;
                }
                tableQuery = tableQuery.slice(0, -1);
                tableQuery += ");"
                db.run(tableQuery);

                //Add SampleData

                if (value.data) {
                    value.data.forEach(element => {
                        let keys = ''
                        let values = ''
                        for (const [data_key, data_value] of Object.entries(element)) {
                            keys += `${data_key},`;
                            if (!Number.isInteger(data_value)) {
                                values += `"${data_value}",`
                            }
                            else {
                                values += `${data_value},`;
                            }
                        }
                        keys = keys.slice(0, -1);
                        values = values.slice(0, -1);
                        let dataQuery = `INSERT INTO ${key} (${keys}) VALUES (${values})`;
                        console.log(dataQuery);
                        db.run(dataQuery);
                    });

                }

            }
        }
    })
}


db.all("select name from sqlite_master where type='table'", (err, routes) => {
    let catalog = []
    // Add routing for every database
    routes.forEach(route => {
        for (const name of Object.values(route)) {
            catalog.push(name);
            app.get(`/${name}`, (req, res) => {
                res.setHeader('Content-Type', 'application/json');
                console.log(`SELECT * FROM ${name};`);
                db.all(`SELECT * FROM ${name};`, [], (err, result) => {
                    res.json(result);
                });
            })
        }
    })

    // Create Catalog for dynamic routing 
    app.get("/", (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.json({
            "Catalog": catalog
        })
    })
})

app.get("/cart", (res, req) => {
    
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    const arg = process.argv.filter(x => x.match(/--database*/g))[0];
    if (arg && arg.replace("--database=", "") == "refresh") {
        console.log("Refreshing Database....");
        refreshDatabase();
        console.log("Database refreshed");
    }
})