const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../utils/fileUpload.util');
const { uploadImage } = require('../controllers/upload.controller');

router.use(authenticate);

router.post('/image', upload.single('image'), uploadImage);

module.exports = router;
