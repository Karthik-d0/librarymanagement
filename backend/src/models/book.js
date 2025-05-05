const { pool } = require('../config/db');

const BookModel = {
  getAll: async (filters = {}) => {
    try {
      let query = `
        SELECT b.*, c.CategoryName 
        FROM books b
        LEFT JOIN categories c ON b.CategoryID = c.CategoryID
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      if (filters.title) {
        query += ' AND b.Title LIKE ?';
        queryParams.push(`%${filters.title}%`);
      }
      
      if (filters.author) {
        query += ' AND b.Author LIKE ?';
        queryParams.push(`%${filters.author}%`);
      }
      
      if (filters.category) {
        query += ' AND b.CategoryID = ?';
        queryParams.push(filters.category);
      }
      
      if (filters.available) {
        query += ' AND b.AvailableCopies > 0';
      }
      
      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error in BookModel.getAll:', error);
      throw new Error('Failed to retrieve books');
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await pool.query(
        `SELECT b.*, c.CategoryName 
         FROM books b
         LEFT JOIN categories c ON b.CategoryID = c.CategoryID
         WHERE b.BookID = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in BookModel.getById:', error);
      throw new Error('Failed to retrieve book');
    }
  },

  create: async (bookData) => {
    try {
      const {
        title,
        author,
        isbn,
        publicationYear,
        publisher,
        totalCopies = 1, // Default value
        categoryId,
        coverImageURL = null // Default to null if not provided
      } = bookData;

      // Validate required fields
      if (!title || !author) {
        throw new Error('Title and author are required');
      }

      const [result] = await pool.query(
        `INSERT INTO books 
        (Title, Author, ISBN, PublicationYear, Publisher, 
         TotalCopies, AvailableCopies, CategoryID, CoverImageURL)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title, 
          author, 
          isbn, 
          publicationYear, 
          publisher,
          totalCopies, 
          totalCopies, // Available copies equals total copies initially
          categoryId, 
          coverImageURL
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error in BookModel.create:', error);
      throw error; // Re-throw the error for controller to handle
    }
  },

  update: async (id, bookData) => {
    try {
      // Get current book data
      const currentBook = await BookModel.getById(id);
      if (!currentBook) {
        throw new Error('Book not found');
      }

      // Merge existing data with updates
      const updatedBook = { 
        ...currentBook, 
        ...bookData,
        // Ensure these fields are not accidentally set to undefined
        coverImageURL: bookData.coverImageURL !== undefined 
          ? bookData.coverImageURL 
          : currentBook.coverImageURL
      };

      const [result] = await pool.query(
        `UPDATE books 
        SET Title = ?, Author = ?, ISBN = ?, PublicationYear = ?,
            Publisher = ?, TotalCopies = ?, AvailableCopies = ?, 
            CategoryID = ?, CoverImageURL = ?
        WHERE BookID = ?`,
        [
          updatedBook.Title, 
          updatedBook.Author, 
          updatedBook.ISBN, 
          updatedBook.PublicationYear,
          updatedBook.Publisher, 
          updatedBook.TotalCopies, 
          updatedBook.AvailableCopies, 
          updatedBook.CategoryID, 
          updatedBook.CoverImageURL, 
          id
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in BookModel.update:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      // First check if book exists
      const book = await BookModel.getById(id);
      if (!book) {
        throw new Error('Book not found');
      }

      const [result] = await pool.query(
        'DELETE FROM books WHERE BookID = ?', 
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in BookModel.delete:', error);
      throw error;
    }
  },

  updateAvailability: async (id, isCheckout) => {
    try {
      let query;
      
      if (isCheckout) {
        query = `UPDATE books 
                SET AvailableCopies = AvailableCopies - 1, 
                Availability = (AvailableCopies - 1 > 0)
                WHERE BookID = ? AND AvailableCopies > 0`;
      } else {
        query = `UPDATE books 
                SET AvailableCopies = AvailableCopies + 1,
                Availability = true
                WHERE BookID = ? AND AvailableCopies < TotalCopies`;
      }
      
      const [result] = await pool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in BookModel.updateAvailability:', error);
      throw error;
    }
  },

  getCoverImageUrl: async (id) => {
    try {
      const [rows] = await pool.query(
        'SELECT CoverImageURL FROM books WHERE BookID = ?',
        [id]
      );
      return rows[0]?.CoverImageURL || null;
    } catch (error) {
      console.error('Error in BookModel.getCoverImageUrl:', error);
      throw error;
    }
  }
};

module.exports = BookModel;