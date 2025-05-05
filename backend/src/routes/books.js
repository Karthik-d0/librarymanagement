const express = require('express');
const router = express.Router();
const BookController = require('../controllers/bookController');
const upload = require('../middleware/upload'); // Upload middleware to handle file upload
const { auth, isLibrarianOrAdmin } = require('../middleware/auth');

router.get('/', BookController.getAllBooks);

router.get('/:id', BookController.getBookById);


router.post('/', auth, isLibrarianOrAdmin, upload.single('coverImage'), BookController.createBook);

router.put('/:id', auth, isLibrarianOrAdmin, upload.single('coverImage'), BookController.updateBook);

router.delete('/:id', auth, isLibrarianOrAdmin, BookController.deleteBook);

module.exports = router;
