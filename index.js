///// SETTING UP NODE SERVER /////

const express = require("express");
const app = express();

///// REQUIRE DATABASE FUNCTIONS /////

const db = require("./utils/db");

///// FILE UPLOAD BOILERPLATE /////

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            // creates a random unique name for the uploaded file and attaches it to its extension
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152 // ~2MB
    }
});

///// REQUIRE AWS STORAGE /////

const s3 = require("./utils/s3");
const config = require("./utils/config.json");

///// MOMENT.JS TO FORMAT DATE /////

const moment = require("moment");

///// SERVE FILES IN /public /////

app.use(express.static("public"));

///// SET req.body TO BE THE JSON SENT BY THE AXIOS REQUEST /////

app.use(express.json());

///// ROUTES /////

app.get("/images", (req, res) => {
    console.log("GET request to /images");
    db.getImgs()
        .then(imgs => {
            console.log("Imgs", imgs);
            res.json(imgs);
        })
        .catch(error => {
            console.log("Error in getImgs query:", error);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    // req.file === file that was just uploaded
    // req.body === values typed in the input fields
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    const { filename } = req.file;
    const url = config.s3Url + filename;
    const { username, title, description } = req.body;
    console.log("URL:", url);

    db.uploadImg(url, username, title, description)
        .then(data => {
            console.log("Returned values from uploadImg query:", data);
            res.json(data);
        })
        .catch(error => {
            console.log("Error in uploadImg query:", error);
        });
});

app.get("/modal/:id", (req, res) => {
    console.log("GET request to /modal");
    console.log("req in /modal", req.params);
    let id = req.params.id;
    db.currentImg(id)
        .then(currentImg => {
            console.log("Current img:", currentImg);
            let date = moment(currentImg.created_at).fromNow();
            currentImg.created_at = date;
            res.json(currentImg);
        })
        .catch(error => {
            console.log("Error in currentImg query:", error);
        });
});

app.listen(8080, () => {
    console.log("Port 8080: Express listening.");
});
