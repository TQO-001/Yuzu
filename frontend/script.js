const taskList = document.getElementById('taskList');
const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');

const API_URL = 'http://localhost:3001/tasks';

// Fetch and display tasks
function loadTasks() {
  fetch(API_URL)
    .then(res => res.json())
    .then(tasks => {
      taskList.innerHTML = '';
      tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.title}: ${task.description}`;
        
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => deleteTask(task.id);

        li.appendChild(delBtn);
        taskList.appendChild(li);
      });
    })
    .catch(() => alert('Error loading tasks'));
}

// Add task
taskForm.onsubmit = e => {
  e.preventDefault();
  const title = titleInput.value;
  const description = descriptionInput.value;

  fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ title, description })
  })
  .then(res => {
    if (!res.ok) throw new Error();
    titleInput.value = '';
    descriptionInput.value = '';
    loadTasks();
  })
  .catch(() => alert('Error adding task'));
};

// Delete task
function deleteTask(id) {
  fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  })
  .then(res => {
    if (!res.ok) throw new Error();
    loadTasks();
  })
  .catch(() => alert('Error deleting task'));
}

loadTasks();
