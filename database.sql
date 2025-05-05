-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS library_db;

-- Use the library database
USE library_db;

-- Users table
CREATE TABLE users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'Librarian', 'Student') NOT NULL DEFAULT 'Student',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(50) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
    BookID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Author VARCHAR(100) NOT NULL,
    ISBN VARCHAR(20) UNIQUE,
    PublicationYear INT,
    Publisher VARCHAR(100),
    Availability BOOLEAN DEFAULT TRUE,
    TotalCopies INT DEFAULT 1,
    AvailableCopies INT DEFAULT 1,
    CategoryID INT,
    FOREIGN KEY (CategoryID) REFERENCES categories(CategoryID) ON DELETE SET NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    TransactionID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    BookID INT NOT NULL,
    BorrowDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DueDate DATETIME NOT NULL,
    ReturnDate DATETIME NULL,
    FineAmount DECIMAL(10, 2) DEFAULT 0.00,
    Status ENUM('Borrowed', 'Returned', 'Overdue') DEFAULT 'Borrowed',
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (BookID) REFERENCES books(BookID) ON DELETE CASCADE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Fines table
CREATE TABLE fines (
    FineID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    TransactionID INT NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    Status ENUM('Paid', 'Unpaid') DEFAULT 'Unpaid',
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (TransactionID) REFERENCES transactions(TransactionID) ON DELETE CASCADE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE reservations (
    ReservationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    BookID INT NOT NULL,
    ReservedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpiryDate DATETIME NOT NULL,
    Status ENUM('Pending', 'Fulfilled', 'Cancelled', 'Expired') DEFAULT 'Pending',
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (BookID) REFERENCES books(BookID) ON DELETE CASCADE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    TransactionID INT,
    AmountPaid DECIMAL(10, 2) NOT NULL,
    PaymentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PaymentMethod ENUM('Cash', 'Credit Card', 'Online') DEFAULT 'Cash',
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (TransactionID) REFERENCES transactions(TransactionID) ON DELETE SET NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
    ReportID INT AUTO_INCREMENT PRIMARY KEY,
    ReportType ENUM('Book Inventory', 'User Activity', 'Fine Collection', 'Book Circulation') NOT NULL,
    GeneratedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    AdminID INT NOT NULL,
    ReportData TEXT,
    FOREIGN KEY (AdminID) REFERENCES users(UserID) ON DELETE CASCADE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE books
ADD COLUMN CoverImageURL VARCHAR(255) AFTER Publisher;

-- Index creation for performance optimization
CREATE INDEX idx_transactions_user ON transactions(UserID);
CREATE INDEX idx_transactions_book ON transactions(BookID);
CREATE INDEX idx_books_category ON books(CategoryID);
CREATE INDEX idx_reservations_book ON reservations(BookID);
CREATE INDEX idx_reservations_user ON reservations(UserID);
CREATE INDEX idx_fines_transaction ON fines(TransactionID);