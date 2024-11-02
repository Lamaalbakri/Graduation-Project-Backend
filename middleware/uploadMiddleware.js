/*What Multer Does
File Upload Handling: Multer processes multipart/form-data requests from frontend, which is the format used when uploading files through forms. It parses the incoming request and extracts the file data. it can give name to file and
cloudinary uses this file from multer for further processing*/

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: "./uploads/images",
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

module.exports = upload;