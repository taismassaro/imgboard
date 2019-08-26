const spicedPg = require("spiced-pg");

const { user, pass } = require("../secrets.json");
const db = spicedPg(`postgres:${user}:${pass}@localhost:5432/imgboard`);

///// REQUEST IMAGES /////

exports.getImgs = () => {
    return db
        .query(`SELECT url, username, title, description FROM images`)
        .then(imgs => {
            return imgs.rows;
        });
};
