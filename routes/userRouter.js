const express=require('express')
const router=express.Router()
const userController=require('../controllers/userController')
const userAuth=require('../middleware/userAuth')

router.get('/login', userController.getLogin)
router.post('/login', userController.login)
router.get('/register', userController.getRegister)
router.post('/register', userController.register)
router.get('/dashboard', userAuth, userController.getDashboard)
router.get('/profile', userAuth, userController.getProfile)
router.get('/book-services', userAuth, userController.getBookServices)
router.post('/book-services', userAuth, userController.postBookService)
router.get('/logout', userController.logout)

module.exports=router;