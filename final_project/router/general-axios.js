const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Fetch the full book list using axios
const fetchBookList = async () => {
  const response = await axios.get('http://localhost:5000/');
  return response.data;
};

// Fetch book details by ISBN using axios
const fetchBookByISBN = async (isbn) => {
  const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
  return response.data;
};

// Fetch book details by author using axios
const fetchBooksByAuthor = async (author) => {
  const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
  return response.data;
};

// Fetch book details by title using axios
const fetchBooksByTitle = async (title) => {
  const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
  return response.data;
};

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: 'Username and password are required.'});
  }

  if (!isValid(username)) {
    return res.status(400).json({message: 'User already exists or invalid username.'});
  }

  users.push({ username: username, password: password });
  return res.status(201).json({message: 'User successfully registered.'});
});

public_users.get('/', async function (req, res) {
  try {
    const data = await fetchBookList();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Could not fetch book list.' });
  }
});

public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const data = await fetchBookByISBN(req.params.isbn);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(404).json({ message: 'Book not found' });
  }
});

public_users.get('/author/:author', async function (req, res) {
  try {
    const data = await fetchBooksByAuthor(req.params.author);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(404).json({ message: 'No books found for author.' });
  }
});

public_users.get('/title/:title', async function (req, res) {
  try {
    const data = await fetchBooksByTitle(req.params.title);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(404).json({ message: 'No books found with title.' });
  }
});

public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: 'Book not found'});
  }
  return res.status(200).send(JSON.stringify(book.reviews || {}, null, 4));
});

module.exports.general = public_users;
module.exports.fetchBookList = fetchBookList;
module.exports.fetchBookByISBN = fetchBookByISBN;
module.exports.fetchBooksByAuthor = fetchBooksByAuthor;
module.exports.fetchBooksByTitle = fetchBooksByTitle;
