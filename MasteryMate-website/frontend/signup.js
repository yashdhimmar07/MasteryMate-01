// Function to toggle the mastery section based on the selected role
function toggleMasterySection() {
    const role = document.getElementById('role').value;
    const masterySection = document.getElementById('masterySection');
  
    if (role === 'service_provider') {
      masterySection.style.display = 'block';
    } else {
      masterySection.style.display = 'none';
    }
  }

  // Function to toggle the experience section based on the selected role
function toggleExperienceSection() {
  const role = document.getElementById('role').value;
  const experienceSection = document.getElementById('experienceSection');

  if (role === 'service_provider') {
    experienceSection.style.display = 'block';
  } else {
    experienceSection.style.display = 'none';
  }
}

// Call the toggleExperienceSection function when the role selection changes
document.getElementById('role').addEventListener('change', toggleExperienceSection);

// Call the toggleExperienceSection function on page load to ensure correct initial state
toggleExperienceSection();
  
  // Event listener for the signup form
  document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const location = document.getElementById('location').value;
    const mastery = role === 'service_provider' ? document.getElementById('mastery').value : undefined;
    const experience = role === 'service_provider' ? document.getElementById('experience').value : undefined;
    
    
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, role, mastery, location, experience })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Redirect the user to the login page after successful signup
          window.location.href = 'login';
        } else {
          // Display the error message
          document.getElementById('message').textContent = data.message;
        }
      })
      .catch(error => {
        console.error('There was an error with the fetch operation:', error);
        document.getElementById('message').textContent = 'Error: Unable to create user';
      });
  });