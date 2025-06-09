// Yes I know there's alot of comments

// Import required packages
const express = require('express');         // Framework for building the server
const sqlite3 = require('sqlite3').verbose(); // SQLite3 for the database
const bodyParser = require('body-parser');  // Middleware to parse JSON request bodies
const cors = require('cors');               // Middleware to allow cross-origin requests
const path = require('path');               // Built-in Node.js module for handling file paths

// Initialize the Express application
const app = express();
const port = 3000; // Port the server will run on, can be changed for uniqueness

// ----- MIDDLEWARE SETUP -----

app.use(cors());              // Enable CORS (Cross-Origin Resource Sharing)
app.use(bodyParser.json());   // Automatically parse incoming JSON data in requests

// Serve static files (like index.html, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// ----- DATABASE SETUP -----

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the tasks database.');
    }
});

// Ensure table exists and insert initial task (safely)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT
        )
    `);

    // Optional: insert only if no tasks exist
    db.get(`SELECT COUNT(*) as count FROM tasks`, (err, row) => {
        if (!err && row.count === 0) {
            db.run(`
                INSERT INTO tasks (title, description)
                VALUES (?, ?)
            `, ['Give Thulani Money', 'Donate to a good christian cause']);
        }
    });
});

// ----- ROUTES -----

// Route to get all tasks
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message }); // Send 500 if there's a DB error
        } else {
            res.status(200).json(rows); // Send back all rows as JSON
        }
    });
});

// Route to create a new task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;

    // Validate the input
    if (!title) {
        res.status(400).json({ error: 'Title is required' }); // Bad request if title is missing
        return;
    }

    // Insert new task into the database
    db.run('INSERT INTO tasks (title, description) VALUES (?, ?)',
        [title, description],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message }); // Internal server error
            } else {
                // Send back the new task's ID and details
                res.status(201).json({ id: this.lastID, title, description });
            }
        });
});

// Route to delete a task by ID
app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;

    // Delete the task with the given ID
    db.run('DELETE FROM tasks WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message }); // Internal server error
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'Task not found' }); // Task not found
        } else {
            res.status(200).json({ message: 'Task deleted successfully' }); // Success
        }
    });
});

// Route to serve index.html when visiting the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----- START THE SERVER -----

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
