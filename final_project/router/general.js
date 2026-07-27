const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Axios-based helper functions for Task 10-13
const getAllBooksAxios = async () => {
  const response = await axios.get('http://localhost:5000/');
  return response.data;
};

const getBookByISBNAxios = async (isbn) => {
  const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
  return response.data;
};

const getBooksByAuthorAxios = async (author) => {
  const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBooksByTitleAxios = async (title) => {
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

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const data = await getAllBooksAxios();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({message: 'Unable to fetch books via Axios.'});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const data = await getBookByISBNAxios(req.params.isbn);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(404).json({message: 'Book not found'});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const data = await getBooksByAuthorAxios(req.params.author);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(404).json({message: 'No books found for author: ' + req.params.author});
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const data = await getBooksByTitleAxios(req.params.title);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(404).json({message: 'No books found with title: ' + req.params.title});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: 'Book not found'});
  }
  return res.status(200).send(JSON.stringify(book.reviews || {}, null, 4));
});

module.exports.general = public_users;
