const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the tasks database.');
});

// Create tasks table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT
)`);

// API endpoints

// GET all tasks
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

// POST a new task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;
    
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }

    db.run('INSERT INTO tasks (title, description) VALUES (?, ?)', 
        [title, description], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: this.lastID, title, description });
        });
});

// DELETE a task
app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;
    
    db.run('DELETE FROM tasks WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});