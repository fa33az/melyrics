import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';

// Load env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Setup session
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set true if using https
}));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`OBS Browser Source URL: http://localhost:${PORT}`);
    console.log(`Don't forget to authenticate at http://localhost:${PORT}/auth/login first!`);
});
