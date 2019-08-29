const spicedPg = require("spiced-pg");

const { user, pass } = require("../secrets.json");
const db = spicedPg(`postgres:${user}:${pass}@localhost:5432/imgboard`);

///// REQUEST IMAGES /////

exports.getImgs = id => {
    let idCheck = "";
    if (id) {
        idCheck = `WHERE id < $1`;
    }
    return db
        .query(
            `SELECT *
        FROM images
        ${idCheck}
        ORDER BY id DESC LIMIT 9`,
            id && [id]
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

exports.currentImg = id => {
    return db
        .query(
            `SELECT *,
            (SELECT id FROM images
                WHERE id > $1
                ORDER BY id ASC
                LIMIT 1) AS "nextId",
            (SELECT id FROM images
                WHERE id < $1
                ORDER BY id DESC
                LIMIT 1) AS "prevId"
            FROM images
            WHERE id = $1`,
            [id]
        )
        .then(currentImg => {
            return currentImg.rows[0];
        });
};

exports.getComments = imgId => {
    return db
        .query(`SELECT * FROM comments WHERE img_id = $1 ORDER BY date DESC`, [
            imgId
        ])
        .then(comments => {
            // console.log("Comments result:", comments);
            return comments.rows;
        });
};

exports.saveComment = (imgId, username, comment) => {
    return db
        .query(
            `INSERT INTO comments (img_id, username, comment) VALUES ($1, $2, $3) RETURNING *`,
            [imgId, username, comment]
        )
        .then(comments => {
            return comments.rows[0];
        });
};
