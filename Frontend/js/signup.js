document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('signup-message');

    // Client-side validation
    if (!fullName.trim()) {
      messageDiv.textContent = 'Full name is required!';
      messageDiv.classList.add('error');
      messageDiv.style.display = 'block';
      return;
    }
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
    if (password !== confirmPassword) {
      messageDiv.textContent = 'Passwords do not match!';
      messageDiv.classList.add('error');
      messageDiv.style.display = 'block';
      return;
    }

    const formData = {
      fullName,
      email,
      password
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        messageDiv.textContent = 'Account created successfully!';
        messageDiv.classList.remove('error');
        messageDiv.classList.add('success');
        messageDiv.style.display = 'block';
        localStorage.setItem('token', result.token); // Store JWT
        document.getElementById('signup-form').reset();
        setTimeout(() => {
          window.location.href = './loginform.html';
        }, 1000); // Delay redirect to show message
      } else {
        messageDiv.textContent = 'Error creating account: ' + (result.message || 'Unknown error');
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