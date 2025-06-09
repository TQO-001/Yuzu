// Wait for the HTML content to fully load before running this script
document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:3000/tasks'; 
    /*
        This works only on the computer where the server is running.
        On other devices (like your phone), it won't work — because "localhost"
        refers to the *device making the request*, not your server.

        For example:
        - On your PC, "localhost:3000" = your Node.js server ✅
        - On your phone, "localhost:3000" = your phone itself ❌ (no server running)

        Dynamically use the origin of the current page’s URL
    
    const apiUrl = `${window.location.origin}/tasks`;

        This makes your frontend automatically match whatever domain or IP was used
        to load the page, which allows it to work across different devices and environments.

        Examples:
        - http://localhost:3000        → when testing on your computer
        - http://192.168.1.5:3000      → when testing on your phone via local network
        - https://yourdomain.com       → when deployed online

        It's one of the simplest and cleanest ways to support multiple environments
        without changing any code manually.
    */

    const tasksContainer = document.getElementById('tasksContainer'); // Where tasks are displayed
    const addTaskForm = document.getElementById('addTaskForm'); // The form to add a new task

    // Function to fetch all tasks from the backend
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

    // Function to render tasks in the DOM
    function displayTasks(tasks) {
        tasksContainer.innerHTML = ''; // Clear current task list

        if (tasks.length === 0) {
            tasksContainer.innerHTML = '<p>No tasks found. Add one above!</p>';
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task';

            // Create HTML structure for each task
            taskElement.innerHTML = `
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                </div>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            `;

            tasksContainer.appendChild(taskElement);
        });

        // Attach click events to all delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const taskId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this task?')) {
                    deleteTask(taskId);
                }
            });
        });
    }

    // Handle form submission to add a new task
    addTaskForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent page reload

        const title = document.getElementById('title').value.trim(); // Remove whitespace
        const description = document.getElementById('description').value.trim();

        // Simple input validation
        if (!title) {
            showMessage('Title is required!', 'error');
            return;
        }

        // Send POST request to API
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add task');
            }
            return response.json();
        })
        .then(newTask => {
            showMessage('Task added successfully!', 'success');
            addTaskForm.reset(); // Clear form fields
            fetchTasks(); // Refresh task list
        })
        .catch(error => {
            showMessage(`Error adding task: ${error.message}`, 'error');
        });
    });

    // Function to delete a task
    function deleteTask(taskId) {
        fetch(`${apiUrl}/${taskId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
            return response.json();
        })
        .then(() => {
            showMessage('Task deleted successfully!', 'success');
            fetchTasks(); // Refresh task list
        })
        .catch(error => {
            showMessage(`Error deleting task: ${error.message}`, 'error');
        });
    }

    // Show a status message (success or error)
    function showMessage(message, type) {
        let messageElement = document.getElementById('status-message');

        // Create message element if it doesn't exist
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'status-message';
            addTaskForm.appendChild(messageElement);
        }

        messageElement.className = `${type}-message`; // Style based on type
        messageElement.textContent = message;

        // Automatically hide after 3 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    // Initial load of tasks when page is ready
    fetchTasks();
});
