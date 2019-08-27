const spicedPg = require("spiced-pg");

const { user, pass } = require("../secrets.json");
const db = spicedPg(`postgres:${user}:${pass}@localhost:5432/imgboard`);

///// REQUEST IMAGES /////

exports.getImgs = () => {
    return db
        .query(
            `SELECT url, username, title, description FROM images ORDER BY id DESC`
        )
        .then(imgs => {
            return imgs.rows;
        });
};

exports.uploadImg = (url, username, title, description) => {
    return db
        .query(
            `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *`,
            [url, username, title, description || null]
        )
        .then(data => {
            return data.rows[0];
        });
};
