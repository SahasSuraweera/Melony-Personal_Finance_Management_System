const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.put('/update/:user_id', userController.updateUser);
router.put('/updateEmail/:user_id', userController.updateEmail);
router.put('/updatePassword/:user_id', userController.updatePassword);
router.put('/delete/:user_id', userController.deleteUser);

module.exports = router;
