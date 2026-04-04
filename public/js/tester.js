document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'tester') {
    window.location.href = '/auth.html';
    return;
  }

  document.getElementById('userNameDisplay').textContent = `Welcome, ${localStorage.getItem('name')}`;
  const container = document.getElementById('testerTasksContainer');
  let bugModalInstance = null;

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tester/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      container.innerHTML = '';
      if (data.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">No completed development tasks to test yet.</p></div>';
      }

      data.forEach(task => {
        // We only show if testerStatus is not "Verified" yet
        if (task.testerStatus === 'Verified') return;

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
                <div class="mb-1"><small><strong>Dev:</strong> ${task.assignedDev ? task.assignedDev.name : 'Unknown'}</small></div>
              </div>
              <div class="card-footer bg-white border-0 text-end">
                <button class="btn btn-danger btn-sm me-2" onclick="openBugModal('${task._id}')">Report Bugs</button>
                <button class="btn btn-success btn-sm" onclick="verifyTask('${task._id}')">Verify Fixes</button>
              </div>
            </div>
          </div>
        `;
      });
    } catch (e) {
      console.error(e);
    }
  };

  window.verifyTask = async (id) => {
    if(!confirm("Are you sure this task works perfectly?")) return;
    try {
      const res = await fetch(`/api/tester/tasks/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if(res.ok) {
        loadTasks();
      } else {
        alert('Failed to verify task');
      }
    } catch(e) {
      alert('Error verifying task');
    }
  };

  window.openBugModal = (id) => {
    document.getElementById('bugReqId').value = id;
    document.getElementById('bugDetails').value = '';
    
    if (!bugModalInstance) {
      bugModalInstance = new bootstrap.Modal(document.getElementById('bugModal'));
    }
    bugModalInstance.show();
  };

  document.getElementById('bugForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('bugReqId').value;
    const bugsReported = document.getElementById('bugDetails').value;

    try {
      const res = await fetch(`/api/tester/tasks/${id}/bug`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bugsReported })
      });
      if (res.ok) {
        bugModalInstance.hide();
        loadTasks();
      } else {
        alert('Failed to report bug');
      }
    } catch (err) {
      alert('Error reporting bug');
    }
  });

  loadTasks();
});
