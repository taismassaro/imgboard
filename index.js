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

///// GET FIRST IMAGES /////

app.get("/images", (req, res) => {
    console.log("GET request to /images");
    db.getImgs()
        .then(imgs => {
            // console.log("Imgs", imgs);
            res.json(imgs);
        })
        .catch(error => {
            console.log("Error in getImgs query:", error);
        });
});

///// INFINITE SCROLL IMAGES /////

app.get("/images/:lastId", (req, res) => {
    console.log("GET request to /images/lastId");
    console.log("req in /images", req.params);

    let lastId = req.params.lastId;
    db.getImgs(lastId)
        .then(imgs => {
            console.log("Imgs", imgs);
            res.json(imgs);
        })
        .catch(error => {
            console.log("Error in getImgs query:", error);
        });
});

///// UPLOAD IMAGE /////

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

///// LOAD MODAL /////

app.get("/modal/:id", (req, res) => {
    console.log("GET request to /modal");
    console.log("req in /modal", req.params);
    let id = req.params.id;
    db.currentImg(id)
        .then(currentImg => {
            console.log("Current img:", currentImg);
            if (!currentImg) {
                console.log("No matching data.");
            }
            db.getComments(currentImg.id)
                .then(comments => {
                    let imgDate = moment(currentImg.created_at).fromNow();
                    currentImg.created_at = imgDate;
                    comments.forEach(comment => {
                        let commentDate = moment(comment.date).fromNow();
                        comment.date = commentDate;
                    });
                    console.log("Comments", comments);

                    let data = {
                        image: currentImg,
                        comments: comments
                    };
                    res.json(data);
                })
                .catch(error => {
                    console.log("Error in getComments query:", error);
                });
        })
        .catch(error => {
            console.log("Error in currentImg query:", error);
            res.json(false);
        });
});

///// POST COMMENT /////

app.post("/comments/:id", (req, res) => {
    console.log("POST comments");
    console.log("req.body:", req.body);

    let imgId = req.params.id;
    console.log("req in /comments", req.params);

    const { username, comment } = req.body;

    db.saveComment(imgId, username, comment)
        .then(comment => {
            console.log("Returned values from saveComment query:", comment);
            let date = moment(comment.date).fromNow();
            comment.date = date;
            res.json(comment);
        })
        .catch(error => {
            console.log("Error in saveComment query:", error);
        });
});

///// SERVER IS RUNNING /////

app.listen(8080, () => {
    console.log("Port 8080: Express listening.");
});
