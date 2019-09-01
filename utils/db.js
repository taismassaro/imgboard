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

///// REQUEST IMAGES BY TAG /////

exports.getImgsByTag = tag => {
    return db
        .query(
            `SELECT *
        FROM images
        JOIN tags ON id = img_id
        WHERE tag = $1
        ORDER BY id DESC LIMIT 9`,
            [tag]
        )
        .then(imgs => {
            return imgs.rows;
        });
};

exports.uploadImg = (url, username, title, description, tags) => {
    return db
        .query(
            `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *`,
            [url, username, title, description || null]
        )
        .then(data => {
            if (tags && tags !== [" "]) {
                let id = data.rows[0].id;
                let count = 1;
                db.query(
                    `INSERT INTO tags (img_id, tag) VALUES ${tags.map(
                        tag => `($1, $${++count})`
                    )}`,
                    [id, ...tags]
                ).catch(error => {
                    console.log("Error inserting tags:", error);
                });
            }
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

exports.getTags = imgId => {
    return db
        .query(`SELECT tag FROM tags WHERE img_id = $1`, [imgId])
        .then(tags => {
            return tags.rows;
        });
};

exports.getComments = imgId => {
    return db
        .query(`SELECT * FROM comments WHERE img_id = $1 ORDER BY date DESC`, [
            imgId
        ])
        .then(comments => {
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
