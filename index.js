const express = require("express");
const app = express();
const port = 3000;

// config parsing body as json
app.use(express.json());

const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./plants.db", (err) => {
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
    });
    db.serialize(() => {
        for (const [key, value] of Object.entries(dbDefault.tables)) {
            if (value.schema) {
                //Generate Table
                let tableQuery = `CREATE TABLE IF NOT EXISTS ${key}(`;
                for (const [schema_key, schema_value] of Object.entries(value.schema)) {
                    tableQuery += `${schema_key} ${schema_value},`;
                }
                tableQuery = tableQuery.slice(0, -1);
                tableQuery += ");";
                console.log(tableQuery);
                db.run(tableQuery);

                //Add SampleData

                if (value.data) {
                    value.data.forEach((element) => {
                        let keys = "";
                        let values = "";
                        for (const [data_key, data_value] of Object.entries(element)) {
                            keys += `${data_key},`;
                            if (!Number.isInteger(data_value)) {
                                values += `"${data_value}",`;
                            } else {
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
    });
};

setRoutes = () => {
    db.all("select name from sqlite_master where type='table'", (err, routes) => {
        let catalog = [];
        // Add routing for every database
        routes.forEach((route) => {
            for (const name of Object.values(route)) {
                catalog.push(name);
                app.get(`/${name}`, (req, res) => {
                    res.setHeader("Content-Type", "application/json");
                    console.log(`SELECT * FROM ${name};`);
                    db.all(`SELECT * FROM ${name};`, [], (err, result) => {
                        res.json(result);
                    });
                });
            }
        });

        // Create Catalog for dynamic routing
        app.get("/", (req, res) => {
            res.setHeader("Content-Type", "application/json");
            res.json({
                "Catalog": catalog,
            });
        });
    });

    // Body requirement
    // data:{ [string]: [{id: [number], amount: [number]}]}
    app.post("/cart", (req, res) => {
        let dataPromise = new Promise((resolve, reject) => {
            db.serialize(() => {
                // const tableQuery = `CREATE TABLE IF NOT EXISTS cart(id INTEGER NOT NULL PRIMARY KEY, category TEXT NOT NULL, productId INTEGER NOT NULL, amount INTEGER NOT NULL, price REAL NOT NULL, sum REAL NOT NULL);`;
                // db.run(tableQuery);
                // for (let [categoryName, category] of Object.entries(req.body.data)) {

                //     //Check if Category exists
                //     let categoryPromise = new Promise((resolve, reject) => {
                //         const categoryCheck = `SELECT * FROM ${categoryName}`
                //         db.all(categoryCheck, (error) => {
                //             if (error) {
                //                 handleErrors(`The category ${categoryName} doesn't exsists. Please check your selection.`, res, error);
                //                 reject(`The category ${categoryName} doesn't exsists. Please check your selection.`);
                //             }
                //             else {
                //                 resolve();
                //             }
                //         });
                //     });

                //     categoryPromise
                //         .then(() => {
                            // for (let product of category) {
                                //Check for Product existance
                                // let productPromise = new Promise((resolve, reject) => {
                                //     let checkProduct = `SELECT * FROM ${categoryName} WHERE id=${product.id}`;
                                //     db.all(checkProduct, (error, result) => {
                                //         if (result && result.length == 0 && !error) {
                                //             error = "Productcount is 0";
                                //         }
                                //         if (error) {
                                //             handleErrors(`The Product in category ${categoryName} with id ${product.id} doesn't exists. Please check your selection.`, res, error)
                                //             reject(`The Product in category ${categoryName} with id ${product.id} doesn't exists. Please check your selection.`);
                                //         }
                                //         else {
                                //             resolve(result[0]);
                                //         }
                                //     });
                                // })

                                // productPromise.then((productInformation) => {
                                    // //Add Product to cart
                                    // let productInCart = `SELECT * FROM cart WHERE id=${product.id} AND category='${categoryName}'`;
                                    // db.all(productInCart, (error, result) => {
                                    //     console.log(error, result);
                                    //     if (error || !result){
                                    //         //Handle Error
                                    //     }
                                    //     if (result && result.length == 0){
                                    //         //Add product to cart
                                    //         const addProduct = `INSERT INTO cart (category, productId, amount, price, sum) VALUES ('${categoryName}', ${product.id}, ${product.amount}, ${productInformation.price}, ${productInformation.price * product.amount})`;
                                    //         db.run(addProduct);
                                    //         console.log(addProduct);
                                    //     }
                                    //     else {
                                    //         //Increase product amount in cart
                                    //     }
                                        
                                    // })
                                // }).catch((error) => reject(error))
                            // }
                //         })
                //         .catch((error) => reject(error));
                // }
                db.on("open", () => {resolve({}); console.log("Test")});
            });

        });
        dataPromise.then((success) => {
            console.log(res.headersSent);
            res.json(success);
            console.log(res.headersSent);
            console.log(req.body);
        }).catch((error) => console.log(error));
    });
};

handleErrors = (message, res, error) => {
    if (!res.headersSent && error) {
        res.json({
            error: {
                message,
                error
            }
        });
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    const arg = process.argv.filter((x) => x.match(/--database*/g))[0];
    if (arg && arg.replace("--database=", "") == "refresh") {
        console.log("Refreshing Database....");
        refreshDatabase();
        console.log("Database refreshed");
    }
    setRoutes();
});
