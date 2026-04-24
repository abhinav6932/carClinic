const express=require('express')
const router=express.Router()
const adminController=require('../controllers/adminController')
const adminAuth=require('../middleware/adminAuth')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.resolve(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

router.get('/login', adminController.getLogin)
router.post('/login', adminController.login)
router.get('/register', adminController.getRegister)
router.post('/register', adminController.register)
router.get('/logout', adminController.logout)

router.get('/dashboard', adminAuth, adminController.dashboard)
router.get('/services/add', adminAuth, adminController.getAddService)
router.post('/services/add', adminAuth, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.render('admin/addService', { error: 'File too large. Maximum size is 5MB.' });
            }
        } else if (err) {
            return res.render('admin/addService', { error: err.message });
        }
        next();
    });
}, adminController.addService);
router.get('/services/:id/edit', adminAuth, adminController.getEditService)
router.post('/services/:id/edit', adminAuth, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.render('admin/editService', { error: 'File too large. Maximum size is 5MB.', service: { _id: req.params.id, ...req.body } });
            }
        } else if (err) {
            return res.render('admin/editService', { error: err.message, service: { _id: req.params.id, ...req.body } });
        }
        next();
    });
}, adminController.editService);
router.post('/services/:id/delete', adminAuth, adminController.deleteService)
router.get('/services/:id/delete', adminAuth, adminController.deleteService)
router.get('/services', adminAuth, adminController.getServices)

router.get("/", (req,res)=>{
    res.render("admin/login")
})

module.exports=router;