// Login Form Submission
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    // Send a POST request to the backend for login
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Check the user's role and redirect accordingly
          if (data.role === 'customer') {
            window.location.href = "customer-profile";
          } else if (data.role === 'service_provider') {
            window.location.href = "provider-dashboard";
          }
        } else {
          document.getElementById("message").textContent = data.message;
        }
      })
      .catch(error => {
        console.error('There was an error with the fetch operation:', error);
        document.getElementById("message").textContent = 'Error: Unable to login';
      });
  });