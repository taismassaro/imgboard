///// SETTING UP SERVER /////

const express = require("express");
const app = express();

const db = require("./utils/db");

app.use(express.static("public"));

app.get("/images", (req, res) => {
    console.log("GET request to /images");
    db.getImgs()
        .then(imgs => {
            console.log("Imgs", imgs);
            res.json(imgs);
        })
        .catch(error => {
            console.log("ERROR:", error);
        });
});

app.listen(8080, () => {
    console.log("Port 8080: Express listening.");
});
