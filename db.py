import sqlite3

def get_connection():
    conn = sqlite3.connect('tasks.db')
    conn.row_factory = sqlite3.Row  # For dict-like access
    return conn

def init_db():
    with get_connection() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL
            )
        ''')
