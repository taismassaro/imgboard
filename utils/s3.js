const aws = require("aws-sdk");

const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("../secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET
});

exports.upload = (req, res, next) => {
    if (!req.file) {
        return res.sendStatus(500); // if file doesn't exist, send an error message to the user
    }
    const { filename, mimetype, size, path } = req.file; // get relevant information from req.file (mimetype === content type based on file extension)

    const promise = s3
        .putObject({
            Bucket: "spicedling",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size
        })
        .promise();

    promise
        .then(() => {
            // it worked!!!
            // file will be at amazon and the url is s3.amazonaws.com/bucketname/filename
            next();
        })
        .catch(err => {
            // uh oh
            console.log("Error in S3 promise:", err);
            res.sendStatus(500);
        })
        .then(() => {
            fs.unlink(path, () => {}); // delete file from your local disk (fs.unlink(path, ()=>{}))
        });
};
