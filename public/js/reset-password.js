document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  document.getElementById('resetToken').value = token;

  const alertContainer = document.getElementById('alert-container');
  const showAlert = (message, type = 'danger') => {
    alertContainer.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  };

  if (!token) {
    showAlert('Missing reset token. Use the link from your email or request a new reset.');
  }

  document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const t = document.getElementById('resetToken').value.trim();
    const password = document.getElementById('resetPassword').value;
    const password2 = document.getElementById('resetPassword2').value;

    if (!t) {
      showAlert('Missing reset token.');
      return;
    }
    if (password !== password2) {
      showAlert('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t, password }),
      });
      const data = await res.json();

      if (res.ok) {
        showAlert(data.message + ' Redirecting to sign in…', 'success');
        setTimeout(() => {
          window.location.href = '/auth.html';
        }, 2000);
      } else {
        showAlert(data.message || 'Reset failed');
      }
    } catch {
      showAlert('Network error. Try again.');
    }
  });
});
