const express = require('express')
const userController = require('../controller/userController')
const bookController = require('../controller/bookController')
const middleware = require('../middleware/auth')
const router = express.Router();


//=========================user Api=========================

router.post('/register',userController.createUser)
router.post("/login", userController.login);

//   ==============Book Api================================

router.post("/books", middleware.auth, bookController.createBook)
router.get("/books", middleware.auth, bookController.getBooks )
router.get("/books/:bookId",middleware.auth, bookController.getBooksById)
router.put('/books/:bookId',middleware.auth,bookController.updateBook)
router.delete("/books/:bookId",  middleware.auth, bookController.deleteBookId)
module.exports = router;