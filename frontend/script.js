const API_URL = 'http://localhost:3001/tasks';
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');

// Load all tasks
function loadTasks() {
  fetch(API_URL)
    .then(res => res.json())
    .then(tasks => {
      taskList.innerHTML = '';
      tasks.forEach(task => renderTask(task));
    })
    .catch(() => alert('Error loading tasks'));
}

// Render a task in the list
function renderTask(task) {
  const li = document.createElement('li');
  li.textContent = `${task.title}: ${task.description}`;

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.onclick = () => deleteTask(task.id);

  li.appendChild(delBtn);
  taskList.appendChild(li);
}

// Add new task
taskForm.onsubmit = (e) => {
  e.preventDefault();
  const title = titleInput.value;
  const description = descInput.value;

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  })
  .then(res => {
    if (!res.ok) throw new Error();
    titleInput.value = '';
    descInput.value = '';
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
