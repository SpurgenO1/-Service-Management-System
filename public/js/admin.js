document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'admin') {
    window.location.href = '/auth.html';
    return;
  }

  document.getElementById('userNameDisplay').textContent = `Welcome, ${localStorage.getItem('name')}`;

  const tableBody = document.getElementById('adminTableBody');
  const assignForm = document.getElementById('assignForm');
  let staffList = [];
  let assignModalInstance = null;

  // Load Staff for dropdowns
  const loadStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      staffList = await res.json();
    } catch (e) {
      console.error(e);
    }
  };

  // Load All Requests
  const loadRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      tableBody.innerHTML = '';
      data.forEach(req => {
        const tr = document.createElement('tr');
        
        const devName = req.assignedDev ? req.assignedDev.name : '<span class="text-danger">Unassigned</span>';
        const testerName = req.assignedTester ? req.assignedTester.name : '<span class="text-danger">Unassigned</span>';
        const clientName = req.client ? req.client.name : 'Unknown';

        tr.innerHTML = `
          <td><small class="text-muted">${req._id.substring(req._id.length - 6).toUpperCase()}</small></td>
          <td>${clientName}</td>
          <td>${req.serviceType}</td>
          <td><span class="badge bg-secondary">${req.status}</span></td>
          <td>${devName}</td>
          <td>${testerName}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick='openManageModal(${JSON.stringify(req)})'>Manage</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    } catch (e) {
      console.error(e);
    }
  };

  window.openManageModal = (req) => {
    document.getElementById('manageReqId').value = req._id;
    document.getElementById('manageStatus').value = req.status;

    const devSelect = document.getElementById('manageDev');
    const testerSelect = document.getElementById('manageTester');
    
    // Populate dropdowns specifically
    devSelect.innerHTML = '<option value="">-- Unassigned --</option>';
    testerSelect.innerHTML = '<option value="">-- Unassigned --</option>';

    staffList.forEach(s => {
      if (s.role === 'developer') {
        devSelect.innerHTML += `<option value="${s._id}" ${req.assignedDev && req.assignedDev._id === s._id ? 'selected' : ''}>${s.name}</option>`;
      } else if (s.role === 'tester') {
        testerSelect.innerHTML += `<option value="${s._id}" ${req.assignedTester && req.assignedTester._id === s._id ? 'selected' : ''}>${s.name}</option>`;
      }
    });

    if (!assignModalInstance) {
      assignModalInstance = new bootstrap.Modal(document.getElementById('assignModal'));
    }
    assignModalInstance.show();
  };

  assignForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('manageReqId').value;
    const status = document.getElementById('manageStatus').value;
    const assignedDev = document.getElementById('manageDev').value || null;
    const assignedTester = document.getElementById('manageTester').value || null;

    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, assignedDev, assignedTester })
      });

      if (res.ok) {
        assignModalInstance.hide();
        loadRequests();
      } else {
        alert('Failed to update request');
      }
    } catch (err) {
      alert('Error updating request');
    }
  });

  await loadStaff();
  loadRequests();
});
