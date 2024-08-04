import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import ejs from 'ejs';
import cookieParser from 'cookie-parser';

import './connection/connectDB.js'; // Refactored for clarity
import { cookieCheckHandler } from './middleware/authentication.js';
import router from './router/user.js';

// Initialize environment variables
dotenv.config();

// Create an Express application
const app = express();
const port = process.env.PORT || 3000;


// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve('./public'))); // Serve static files

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.resolve('views')); // Directory for EJS templates

// Import and use router
app.use('/', cookieCheckHandler(), router);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => console.log(`Server is listening on port ${port}`));
