const BookModel = require('../models/book');

const BookController = {
  getAllBooks: async (req, res) => {
    try {
      const { title, author, category, available } = req.query;
      const filters = { title, author, category, available: available === 'true' };
      const books = await BookModel.getAll(filters);
      res.json({ books });
    } catch (error) {
      console.error('Error getting books:', error);
      res.status(500).json({ message: 'Error fetching books' });
    }
  },

  getBookById: async (req, res) => {
    try {
      const bookId = req.params.id;
      const book = await BookModel.getById(bookId);
      if (!book) return res.status(404).json({ message: 'Book not found' });
      res.json({ book });
    } catch (error) {
      console.error('Error getting book:', error);
      res.status(500).json({ message: 'Error fetching book' });
    }
  },

  createBook: async (req, res) => {
    try {
      const {
        title,
        author,
        isbn,
        publicationYear,
        publisher,
        totalCopies,
        categoryId
      } = req.body;
      console.log(req.body)
      if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
      }

      const coverImageURL = req.file ? req.file.path : null;

      const bookId = await BookModel.create({
        title,
        author,
        isbn,
        publicationYear,
        publisher,
        totalCopies: totalCopies || 1,
        categoryId,
        coverImageURL
      });

      res.status(201).json({ message: 'Book created successfully', bookId });
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({ message: 'Error creating book' });
    }
  },

  updateBook: async (req, res) => {
    try {
      const bookId = req.params.id;
      const {
        title,
        author,
        isbn,
        publicationYear,
        publisher,
        totalCopies,
        availableCopies,
        categoryId
      } = req.body;

      const book = await BookModel.getById(bookId);
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const coverImageURL = req.file ? req.file.path : book.coverImageURL;

      const updated = await BookModel.update(bookId, {
        title,
        author,
        isbn,
        publicationYear,
        publisher,
        totalCopies,
        availableCopies,
        categoryId,
        coverImageURL
      });

      if (!updated) return res.status(400).json({ message: 'Failed to update book' });

      res.json({ message: 'Book updated successfully' });
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ message: 'Error updating book' });
    }
  },

  deleteBook: async (req, res) => {
    try {
      const bookId = req.params.id;
      const book = await BookModel.getById(bookId);
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const deleted = await BookModel.delete(bookId);
      if (!deleted) return res.status(400).json({ message: 'Failed to delete book' });

      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ message: 'Error deleting book' });
    }
  }
};

module.exports = BookController;
