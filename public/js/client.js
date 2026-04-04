document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'client') {
    window.location.href = '/auth.html';
    return;
  }

  document.getElementById('userNameDisplay').textContent = `Welcome, ${localStorage.getItem('name')}`;

  const viewTab = document.getElementById('view-requests-tab');
  const createTab = document.getElementById('create-request-tab');
  const viewSection = document.getElementById('view-requests-section');
  const createSection = document.getElementById('create-request-section');
  const form = document.getElementById('createRequestForm');
  const tableBody = document.getElementById('requestsTableBody');
  const feedbackForm = document.getElementById('feedbackForm');

  let feedbackModalInstance = null;

  // Tab Switching
  viewTab.addEventListener('click', (e) => {
    e.preventDefault();
    viewTab.classList.add('active');
    createTab.classList.remove('active');
    viewSection.classList.remove('d-none');
    createSection.classList.add('d-none');
    loadRequests();
  });

  createTab.addEventListener('click', (e) => {
    e.preventDefault();
    createTab.classList.add('active');
    viewTab.classList.remove('active');
    createSection.classList.remove('d-none');
    viewSection.classList.add('d-none');
  });

  // Load Requests
  const loadRequests = async () => {
    try {
      const res = await fetch('/api/client/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      tableBody.innerHTML = '';
      if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No requests found.</td></tr>';
      }

      data.forEach(req => {
        const tr = document.createElement('tr');
        
        let actionBtn = '-';
        let badgeColor = 'secondary';
        
        switch(req.status) {
          case 'Pending Approval': badgeColor = 'warning'; break;
          case 'In Development': badgeColor = 'primary'; break;
          case 'Ready for Delivery': badgeColor = 'info'; break;
          case 'Completed': badgeColor = 'success'; break;
          case 'Rejected': badgeColor = 'danger'; break;
        }

        if (req.status === 'Completed') {
          actionBtn = `<button class="btn btn-sm btn-outline-success" onclick="openFeedback('${req._id}')">Leave Feedback</button>`;
        }

        tr.innerHTML = `
          <td><small class="text-muted">${req._id.substring(req._id.length - 6).toUpperCase()}</small></td>
          <td>${req.serviceType}</td>
          <td>${req.priority}</td>
          <td><span class="badge bg-${badgeColor}">${req.status}</span></td>
          <td>${actionBtn}</td>
        `;
        tableBody.appendChild(tr);
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Submit Request
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const serviceType = document.getElementById('reqType').value;
    const priority = document.getElementById('reqPriority').value;
    const description = document.getElementById('reqDescription').value;

    try {
      const res = await fetch('/api/client/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serviceType, priority, description })
      });
      if (res.ok) {
        alert('Request created successfully');
        form.reset();
        viewTab.click(); // Switch back to view
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (error) {
      alert('Error creating request');
    }
  });

  // Feedback Modal
  window.openFeedback = (id) => {
    document.getElementById('feedbackReqId').value = id;
    if(!feedbackModalInstance) {
      feedbackModalInstance = new bootstrap.Modal(document.getElementById('feedbackModal'));
    }
    feedbackModalInstance.show();
  };

  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const reqId = document.getElementById('feedbackReqId').value;
    const rating = document.getElementById('feedbackRating').value;
    const comments = document.getElementById('feedbackComments').value;

    try {
      const res = await fetch('/api/client/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serviceRequestId: reqId, rating, comments })
      });
      if (res.ok) {
        alert('Feedback submitted. Thank you!');
        feedbackForm.reset();
        feedbackModalInstance.hide();
      } else {
        const err = await res.json();
        alert(err.message || 'Error submitting feedback');
      }
    } catch (error) {
      alert('Error submitting feedback');
    }
  });

  // Initial load
  loadRequests();
});
