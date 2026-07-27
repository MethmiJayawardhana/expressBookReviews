const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // A username is valid if it's a non-empty string and not already taken
  if (!username || typeof username !== 'string') return false;
  return !users.some(u => u.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(u => u.username === username && u.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: 'Username and password are required.'});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: 'Invalid username or password.'});
  }

  const accessToken = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });
  req.session.authorization = { accessToken: accessToken, username: username };
  return res.status(200).json({message: 'User successfully logged in'});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!books[isbn]) {
    return res.status(404).json({message: 'Book not found'});
  }

  // username should be set by auth middleware on req.user, fallback to session
  const username = req.user || (req.session && req.session.authorization && req.session.authorization.username);
  if (!username) {
    return res.status(401).json({message: 'User not logged in'});
  }

  if (!review) {
    return res.status(400).json({message: 'Review query parameter is required.'});
  }

  if (!books[isbn].reviews) books[isbn].reviews = {};
  books[isbn].reviews[username] = review;

  return res.status(200).json({message: 'Review added/updated', reviews: books[isbn].reviews});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user || (req.session && req.session.authorization && req.session.authorization.username);
  if (!username) {
    return res.status(401).json({message: 'User not logged in'});
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: 'Book not found'});
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({message: 'Review not found for user.'});
  }

  delete book.reviews[username];
  return res.status(200).json({message: 'Review deleted', reviews: book.reviews});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
