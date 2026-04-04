document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'developer') {
    window.location.href = '/auth.html';
    return;
  }

  document.getElementById('userNameDisplay').textContent = `Welcome, ${localStorage.getItem('name')}`;
  const container = document.getElementById('devTasksContainer');

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/developer/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      container.innerHTML = '';
      if (data.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">No assigned tasks found.</p></div>';
      }

      data.forEach(task => {
        let options = '';
        if (task.devStatus === 'Not Started') {
          options = `<button class="btn btn-primary btn-sm" onclick="updateStatus('${task._id}', 'In Progress')">Mark In Progress</button>`;
        } else if (task.devStatus === 'In Progress') {
          options = `<button class="btn btn-success btn-sm" onclick="updateStatus('${task._id}', 'Completed')">Mark Completed</button>`;
        } else {
          options = `<span class="badge bg-success">Development Completed</span>`;
        }

        // Show bugs if tester rejected it
        let bugsUi = '';
        if (task.bugsReported) {
          bugsUi = `<div class="alert alert-danger mt-2"><strong>Bugs Reported:</strong> ${task.bugsReported}</div>`;
        }

        container.innerHTML += `
          <div class="col-md-6 mb-4">
            <div class="card shadow-sm border-0 h-100">
              <div class="card-header bg-white fw-bold d-flex justify-content-between">
                <span>Task ID: ${task._id.substring(task._id.length - 6).toUpperCase()}</span>
                <span class="badge bg-secondary">${task.priority} Priority</span>
              </div>
              <div class="card-body">
                <h5 class="card-title">${task.serviceType}</h5>
                <p class="card-text text-muted">${task.description}</p>
                <div class="mb-2"><strong>Status:</strong> ${task.status}</div>
                ${bugsUi}
              </div>
              <div class="card-footer bg-white border-0 text-end">
                ${options}
              </div>
            </div>
          </div>
        `;
      });
    } catch (e) {
      console.error(e);
    }
  };

  window.updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/developer/tasks/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ devStatus: status })
      });
      if(res.ok) {
        loadTasks();
      } else {
        alert('Failed to update status');
      }
    } catch(e) {
      alert('Error updating status');
    }
  };

  loadTasks();
});
