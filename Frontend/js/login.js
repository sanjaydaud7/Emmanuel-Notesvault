document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.querySelector('.login-form input[type="email"]').value;
    const password = document.querySelector('.login-form input[type="password"]').value;
    const messageDiv = document.querySelector('#login-message');

    // Client-side validation
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      messageDiv.textContent = 'Invalid email format!';
      messageDiv.classList.add('error');
      messageDiv.style.display = 'block';
      return;
    }
    if (password.length < 8) {
      messageDiv.textContent = 'Password must be at least 8 characters long!';
      messageDiv.classList.add('error');
      messageDiv.style.display = 'block';
      return;
    }

    const formData = {
      email,
      password
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        messageDiv.textContent = 'Login successful!';
        messageDiv.classList.remove('error');
        messageDiv.classList.add('success');
        messageDiv.style.display = 'block';
        localStorage.setItem('token', result.token); // Store JWT
        setTimeout(() => {
          window.location.href = 'index.html'; // Redirect to homepage
        }, 1000); // Delay redirect to show message
      } else {
        messageDiv.textContent = 'Error logging in: ' + (result.message || 'Unknown error');
        messageDiv.classList.add('error');
        messageDiv.style.display = 'block';
      }
    } catch (error) {
      console.error('Error:', error);
      messageDiv.textContent = `An error occurred: ${error.message}. Please try again later.`;
      messageDiv.classList.add('error');
      messageDiv.style.display = 'block';
    }
  });
});