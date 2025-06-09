from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection, init_db

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate

init_db()  # Ensure DB table exists

# GET /tasks - Return all tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    with get_connection() as conn:
        cursor = conn.execute('SELECT * FROM tasks')
        tasks = [dict(row) for row in cursor.fetchall()]
        return jsonify(tasks), 200

# POST /tasks - Add new task
@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    if not title or not description:
        return jsonify({'error': 'Missing title or description'}), 400

    with get_connection() as conn:
        cursor = conn.execute(
            'INSERT INTO tasks (title, description) VALUES (?, ?)',
            (title, description)
        )
        conn.commit()
        return jsonify({'id': cursor.lastrowid}), 201

# DELETE /tasks/:id - Delete task by ID
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    with get_connection() as conn:
        cursor = conn.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'error': 'Task not found'}), 404
        return jsonify({'message': 'Deleted'}), 200

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=3001)
