const express = require("express");
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const VendorsController = require('../controllers/vendors');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get("/", VendorsController.vendors_get_all);

router.post("/", checkAuth, upload.single('vendorImage'), VendorsController.vendors_create_vendor);

router.get("/:vendorId", VendorsController.vendors_get_vendor);

router.patch("/:vendorId", checkAuth, VendorsController.vendors_update_vendor);

router.delete("/:vendorId", checkAuth, VendorsController.vendors_delete);

module.exports = router;
