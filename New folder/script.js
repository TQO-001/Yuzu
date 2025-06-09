document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://localhost:3000/tasks';
    const tasksContainer = document.getElementById('tasksContainer');
    const addTaskForm = document.getElementById('addTaskForm');
    
    // Fetch and display all tasks
    function fetchTasks() {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(tasks => {
                displayTasks(tasks);
            })
            .catch(error => {
                showMessage(`Error fetching tasks: ${error.message}`, 'error');
            });
    }
    
    // Display tasks in the UI
    function displayTasks(tasks) {
        tasksContainer.innerHTML = '';
        
        if (tasks.length === 0) {
            tasksContainer.innerHTML = '<p>No tasks found. Add one above!</p>';
            return;
        }
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task';
            
            taskElement.innerHTML = `
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                </div>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            `;
            
            tasksContainer.appendChild(taskElement);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const taskId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this task?')) {
                    deleteTask(taskId);
                }
            });
        });
    }
    
    // Add a new task
    addTaskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(newTask => {
            showMessage('Task added successfully!', 'success');
            addTaskForm.reset();
            fetchTasks();
        })
        .catch(error => {
            showMessage(`Error adding task: ${error.message}`, 'error');
        });
    });
    
    // Delete a task
    function deleteTask(taskId) {
        fetch(`${apiUrl}/${taskId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => {
            showMessage('Task deleted successfully!', 'success');
            fetchTasks();
        })
        .catch(error => {
            showMessage(`Error deleting task: ${error.message}`, 'error');
        });
    }
    
    // Show status messages
    function showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `${type}-message`;
        messageElement.textContent = message;
        
        // Remove any existing messages
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Add the new message after the form
        addTaskForm.appendChild(messageElement);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
    
    // Initial load
    fetchTasks();
});