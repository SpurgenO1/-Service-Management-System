document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const alertContainer = document.getElementById('alert-container');

  // If already logged in, redirect to respective dashboard
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  // Only redirect if we are on the login/register page or home page
  if (token && role && (window.location.pathname.includes('/auth.html') || window.location.pathname === '/' || window.location.pathname.includes('/index.html'))) {
    window.location.href = `/dashboards/${role}.html`;
  }

  const showAlert = (message, type = 'danger') => {
    alertContainer.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  };

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('name', data.name);
          window.location.href = `/dashboards/${data.role}.html`;
        } else {
          const msg = data.errors && data.errors[0] ? data.errors[0].msg : data.message;
          showAlert(msg || 'Sign in failed');
        }
      } catch (err) {
        showAlert('An error occurred during login');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: 'client' })
        });
        const data = await res.json();
        
        if (res.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('name', data.name);
          window.location.href = `/dashboards/client.html`;
        } else {
          const msg = data.errors && data.errors[0] ? data.errors[0].msg : data.message;
          showAlert(msg || 'Registration failed');
        }
      } catch (err) {
        showAlert('An error occurred during registration');
      }
    });
  }
});

// Common utility to logout
window.logout = () => {
  localStorage.clear();
  window.location.href = '/auth.html';
};
