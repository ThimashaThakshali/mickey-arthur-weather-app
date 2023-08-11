// Handle form submission for login
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);

    function handleLogin(event) {
        event.preventDefault();

        // Get username and password values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Perform validation
        if (!isValidEmail(username)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (password.trim() === '') {
            alert('Please enter a password.');
            return;
        }

        // Check if the entered credentials match the predefined values
        if (username === 'ugthimashath@gmail.com' && password === 'password123') {
            // Redirect to the desired page after successful login
            // Replace 'index.html' with your actual weather details page
            window.location.href = 'index.html';
        } else {
            alert('Invalid username or password. Please try again.');
        }
    }

    //function to validate email address
    function isValidEmail(email) {
        // A simple regex pattern to check if the email is valid
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
	}
