document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotForm');
  const alertContainer = document.getElementById('alert-container');

  const showAlert = (message, type = 'danger') => {
    alertContainer.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        let msg = data.message;
        if (data.resetToken) {
          msg += ` <strong>Dev only:</strong> token returned because DEV_RETURN_RESET_TOKEN=true. <a href="/reset-password.html?token=${encodeURIComponent(data.resetToken)}">Open reset page</a>`;
        }
        showAlert(msg, 'success');
      } else {
        showAlert(data.message || 'Something went wrong');
      }
    } catch {
      showAlert('Network error. Try again.');
    }
  });
});
