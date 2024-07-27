document.addEventListener("DOMContentLoaded", () => {
    // Load tasks on page load
    refreshTasks();
    
    // Load ratings on page load
    refreshRatings();
    
    // Load all providers and customers on page load
    loadAllUsers();
  
     // Create a new task
     const createTaskForm = document.getElementById("create-task-form");
     if (createTaskForm) {
         createTaskForm.addEventListener("submit", (event) => {
             event.preventDefault();
             const title = document.getElementById("create-task-title").value;
             const description = document.getElementById("create-task-description").value;
             const category = document.getElementById("create-task-category").value;
             const budget = document.getElementById("create-task-budget").value;
             createTask(title, description, category, budget).then(() => {
                 refreshTasks();
             });
         });
     }

    // Search for providers and customers
    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const searchInput = document.getElementById("search-input").value;
            searchUsers(searchInput);
        });
    }

    // Attach event listener to navbar links to toggle active section
    const navLinks = document.querySelectorAll(".navbar-menu a.nav-link");
    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const targetSectionId = link.getAttribute("href").substring(1); // Get the section id from href attribute
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                // Remove active class from all sections
                document.querySelectorAll(".section").forEach((section) => {
                    section.classList.remove("active");
                });
                // Add active class to target section
                targetSection.classList.add("active");
                // Remove active class from all navbar links
                navLinks.forEach((navLink) => {
                    navLink.classList.remove("active");
                });
                // Add active class to clicked link
                link.classList.add("active");
            } else {
                console.warn(`Section with id "${targetSectionId}" not found.`);
            }
        });
    });

    fetch("/messages")
    .then((response) => response.json())
    .then((data) => {
      const messagesTableBody = document.getElementById("messages-table-body");
      data.forEach((message) => {
        messagesTableBody.appendChild(createMessageRow(message));
      });
    });
    
      // Load messages on page load
      refreshMessages();

          // Attach event listener to message buttons using event delegation
    document.addEventListener("click", (event) => {
      if (event.target.classList.contains("message-provider-btn")) {
        const providerId = event.target.dataset.providerId;
        console.log(`Message button clicked for provider with ID: ${providerId}`);
        // Implement your message functionality here
        // Here, you can implement your message functionality
        const messageContent = prompt("Enter your message:");
        if (messageContent) {
          sendMessage(providerId, messageContent);
        }
      }
    });

    // Logout functionality
    const logoutButton = document.getElementById("logout-btn");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            fetch("/logout", {
                method: "GET",
                credentials: "same-origin",
            })
            .then((response) => {
                if (response.redirected) {
                    // Redirect to the home page after logout
                    window.location.href = response.url;
                }
            })
            .catch((error) => {
                console.error("Error logging out:", error);
                alert("Error logging out. Please try again.");
            });
        });
    }
     // Load appointment requests on page load
  refreshAppointmentRequests();
  refreshAppointments();
});

// Function to refresh appointment requests
async function refreshAppointmentRequests() {
  try {
    const response = await fetch('/appointments');
    const appointments = await response.json();

    const appointmentsRequestContainer = document.getElementById("appointments-request-container");
    appointmentsRequestContainer.innerHTML = "";
    appointments.forEach((appointment) => {
      if (appointment.status === 'pending') {
        const card = createAppointmentRequestRow(appointment);
        appointmentsRequestContainer.appendChild(card);
      }
    });
  } catch (error) {
    console.error("Error loading appointment requests:", error);
  }
}

// Function to refresh all appointments
async function refreshAppointments() {
  try {
    const response = await fetch('/appointments');
    const appointments = await response.json();

    const appointmentsContainer = document.getElementById("appointments-container");
    appointmentsContainer.innerHTML = "";
    appointments.forEach((appointment) => {
      const card = createAppointmentCard(appointment);
      appointmentsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading appointments:", error);
  }
}

// Function to create an appointment request row
function createAppointmentRequestRow(request) {
  const providerId = request.providerId;
  const customerName = request.customerName;

  const card = document.createElement("div");
  card.classList.add("card", "mb-3", "appointment-request-card");

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const title = document.createElement("h5");
  title.classList.add("card-title");
  title.textContent = request.title;

  const description = document.createElement("p");
  description.classList.add("card-text");
  description.textContent = request.description;

  const location = document.createElement("p");
  location.classList.add("card-text");
  location.textContent = `Location: ${request.location}`;

  const budget = document.createElement("p");
  budget.classList.add("card-text");
  budget.textContent = `Budget: ${request.budget}`;

  const date = document.createElement("p");
  date.classList.add("card-text");
  date.textContent = `Date: ${request.date}`;

  const time = document.createElement("p");
  time.classList.add("card-text");
  time.textContent = `Time: ${request.time}`;

  const status = document.createElement("p");
  status.classList.add("card-text");
  status.textContent = `Status: ${request.status}`;

  const buttonGroup = document.createElement("div");
  buttonGroup.classList.add("btn-group");

  const acceptBtn = document.createElement("button");
  acceptBtn.classList.add("btn", "btn-success", "accept-btn");
  acceptBtn.setAttribute("data-request-id", request._id);
  acceptBtn.textContent = "Accept";
  acceptBtn.addEventListener("click", () => {
    acceptAppointmentRequest(request._id, customerName);
  });

  const rejectBtn = document.createElement("button");
  rejectBtn.classList.add("btn", "btn-danger", "reject-btn");
  rejectBtn.setAttribute("data-request-id", request._id);
  rejectBtn.textContent = "Reject";
  rejectBtn.addEventListener("click", () => {
    rejectAppointmentRequest(request._id, customerName);
  });

  buttonGroup.appendChild(acceptBtn);
  buttonGroup.appendChild(rejectBtn);

  cardBody.appendChild(title);
  cardBody.appendChild(description);
  cardBody.appendChild(location);
  cardBody.appendChild(budget);
  cardBody.appendChild(date);
  cardBody.appendChild(time);
  cardBody.appendChild(status);
  cardBody.appendChild(buttonGroup);

  card.appendChild(cardBody);

  return card;
}
async function acceptAppointmentRequest(requestId, customerName) {
  try {
    // Generate a random 4-digit code
    const confirmationCode = Math.floor(Math.random() * 9000) + 1000;

    // Update the appointment request status to "accepted"
    await fetch(`/appointments/${requestId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accepted" }),
    });

    // Send a message to the customer with the confirmation code
    await sendMessage(customerName, `Your appointment request has been accepted. Confirmation code: ${confirmationCode}`);

    // Display the confirmation code to the provider
    alert(`Appointment request accepted. Confirmation code: ${confirmationCode}`);

    // Refresh the appointment requests
    refreshAppointmentRequests();
  } catch (error) {
    console.error("Error accepting appointment request:", error);
  }
}

async function rejectAppointmentRequest(requestId, customerName) {
  try {
    // Update the appointment request status to "rejected"
    await fetch(`/appointments/${requestId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "rejected" }),
    });

    // Send a message to the customer about the rejection
    await sendMessage(customerName, "Your appointment request has been rejected.");

    // Refresh the appointment requests
    refreshAppointmentRequests();
  } catch (error) {
    console.error("Error rejecting appointment request:", error);
  }
}
// Function to send a message to a customer
async function sendMessage(customerName, content) {
  try {
    const response = await fetch("/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId: "provider", // Assuming the sender is the provider
        receiverId: customerName,
        content,
      }),
    });

    if (response.ok) {
      console.log("Message sent successfully");
    } else {
      console.error("Failed to send message");
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}


function createAppointmentCard(appointment) {
  const card = document.createElement("div");
  card.classList.add("card", "mb-3", "appointment-card");

 // Check the appointment status and add corresponding class
 if (appointment.status === "accepted") {
  card.classList.add("accepted");
} else if (appointment.status === "rejected") {
  card.classList.add("rejected");
} else if (appointment.status === "pending") {
  card.classList.add("pending");
}


  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const title = document.createElement("h5");
  title.classList.add("card-title");
  title.textContent = appointment.title;

  const description = document.createElement("p");
  description.classList.add("card-text");
  description.textContent = appointment.description;

  const location = document.createElement("p");
  location.classList.add("card-text");
  location.textContent = `Location: ${appointment.location}`;

  const budget = document.createElement("p");
  budget.classList.add("card-text");
  budget.textContent = `Budget: ${appointment.budget}`;

  const date = document.createElement("p");
  date.classList.add("card-text");
  date.textContent = `Date: ${appointment.date}`;

  const time = document.createElement("p");
  time.classList.add("card-text");
  time.textContent = `Time: ${appointment.time}`;

  const status = document.createElement("p");
  status.classList.add("card-text");
  status.textContent = `Status: ${appointment.status}`;

  cardBody.appendChild(title);
  cardBody.appendChild(description);
  cardBody.appendChild(location);
  cardBody.appendChild(budget);
  cardBody.appendChild(date);
  cardBody.appendChild(time);
  cardBody.appendChild(status);

  card.appendChild(cardBody);

  return card;
}

function loadAllUsers() {
    fetch('/users')
        .then(response => response.json())
        .then(data => {
            data.forEach(user => {
                const card = createProviderCard(user);
                document.getElementById('all-users').appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading users:', error);
        });
}

// Call the loadAllUsers function when the page loads
window.addEventListener('load', loadAllUsers);
  // Function to send message to a provider
  async function sendMessage(providerId, content) {
    try {
      // You can replace this with your actual endpoint and payload structure
      const response = await fetch("/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: "provider", // Assuming the sender is the provider
          receiverId: providerId,
          content: content,
        }),
      });
  
      if (response.ok) {
        console.log("Message sent successfully");
        alert("Message sent successfully");
        refreshMessages();
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
  
  async function submitRating(providerId, rating) {
    try {
      const response = await fetch(`/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ providerId, rating }),
      });
  
      if (response.ok) {
        alert("Rating submitted successfully!");
        // Optionally, update the UI to reflect the new rating
      } else {
        throw new Error("Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again later.");
    }
  }

  // Function to search for providers and customers
async function searchUsers(keyword) {
    try {
        const response = await fetch(`/search/users?keyword=${keyword}`);
        const users = await response.json();

        // Clear previous search results
        const searchResultsContainer = document.getElementById("search-results");
        searchResultsContainer.innerHTML = "";

        // Display search results
        users.forEach((user) => {
            const card = createProviderCard(user);
            searchResultsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Error searching for users:", error);
    }
}
  
  async function createTask(title, description, category, budget) {
    const response = await fetch("/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        category,
        budget,
        status: "pending",
      }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to create task");
    }
  }
  
  function refreshTasks() {
    fetch("/tasks")
      .then((response) => response.json())
      .then((data) => {
        const tasksTableBody = document.getElementById("tasks-table-body");
        tasksTableBody.innerHTML = "";
        data.forEach((task) => {
          tasksTableBody.appendChild(createTaskRow(task));
        });
      });
  }
  
  function createTaskRow(task) {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${task.title}</td>
          <td>${task.description}</td>
          <td>${task.category}</td>
          <td>${task.budget}</td>
          <td>${task.status}</td>
          <td>
              <button class="btn btn-primary update-task-btn" data-task-id="${task._id}">Update Status</button>
              <button class="btn btn-danger delete-task-btn" data-task-id="${task._id}">Delete</button>
          </td>
      `;
  
    const updateBtn = row.querySelector(".update-task-btn");
    updateBtn.addEventListener("click", () => {
      const taskId = updateBtn.dataset.taskId;
      const currentStatus = task.status;
      updateTaskStatus(taskId, currentStatus).then(() => {
        refreshTasks();
      });
    });
  
    const deleteBtn = row.querySelector(".delete-task-btn");
    deleteBtn.addEventListener("click", () => {
      const taskId = deleteBtn.dataset.taskId;
      deleteTask(taskId).then(() => {
        refreshTasks();
      });
    });
  
    return row;
  }
  
  async function updateTaskStatus(taskId, currentStatus) {
    const newStatus = currentStatus === "complete" ? "in-progress" : "complete";
    const response = await fetch(`/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to update task status");
    }
  }
  
  async function deleteTask(taskId) {
    const response = await fetch(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  }
  
  async function refreshMessages() {
    fetch("/messages")
      .then((response) => response.json())
      .then((data) => {
        const messagesTableBody = document.getElementById("messages-table-body");
        messagesTableBody.innerHTML = "";
        data.forEach((message) => {
          messagesTableBody.appendChild(createMessageRow(message));
        });
      });
  }
  
  function createMessageRow(message) {
    const row = document.createElement("tr");
    const markAsReadButton = document.createElement("button");
    markAsReadButton.classList.add("btn", "btn-primary", "mark-as-read-btn");
    markAsReadButton.setAttribute("data-message-id", message._id);
    markAsReadButton.textContent = "Mark as Read";
    markAsReadButton.addEventListener("click", () => {
        markMessageAsRead(message._id).then(() => {
            refreshMessages();
        });
    });
  
    const messageStatus = message.status.toLowerCase(); // Convert status to lowercase for consistency
  
    if (message.senderId === "customer") {
        row.innerHTML = `
            <td>${message.senderId}</td>
            <td>${message.content}</td>
            <td>${messageStatus}</td>
            <td></td>
        `;
        if (messageStatus !== "read") {
            row.querySelector("td:last-child").appendChild(markAsReadButton);
        }
    } else {
        row.innerHTML = `
            <td>${message.senderId}</td>
            <td>${message.content}</td>
            <td>${messageStatus}</td>
            <td></td>
        `;
    }
  
    return row;
}

async function markMessageAsRead(messageId) {
    try {
        const response = await fetch(`/messages/${messageId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "read" }),
        });
  
        if (response.ok) {
            // Refresh messages after marking a message as read
            refreshMessages();
        } else {
            console.error("Failed to mark message as read");
        }
    } catch (error) {
        console.error("Error marking message as read:", error);
    }
}

  
  async function refreshRatings() {
    fetch("/ratings")
      .then((response) => response.json())
      .then((data) => {
        const ratingsContainer = document.getElementById("ratings-container");
        ratingsContainer.innerHTML = "";
        data.forEach((rating) => {
          ratingsContainer.appendChild(createRatingCard(rating));
        });
      });
  }
  
  function createProviderCard(provider) {
    const card = document.createElement("div");
    card.classList.add('card', 'mb-3', 'col-md-4', 'provider-card'); // Add provider-card class for custom styling
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${provider.username}</h5>
            <hr class="divider">
            <p class="card-text">${provider.role}</p>
            ${
                provider.role === 'service_provider'
                    ? `<p class="card-text"><strong>Mastery:</strong> ${provider.mastery}</p><p class="card-text"><strong>Experience:</strong> ${provider.experience}</p>`
                    : ''
            }
            <p class="card-text"><strong>Location:</strong> ${provider.location}</p>
            <!-- Rating Form -->
            <form class="rating-form">
                <label for="rating">Rate this provider:</label>
                <input type="number" id="rating" placeholder="1 to 5" name="rating" min="1" max="5" required>
                <button type="submit" class="btn btn-primary">Submit Rating</button>
            </form>
        </div>
    `;

    const ratingForm = card.querySelector(".rating-form");
    ratingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const rating = ratingForm.querySelector("#rating").value;
        submitRating(provider._id, rating);
    });

    const messageButton = document.createElement("button");
    messageButton.style.marginTop = "10px";
    messageButton.classList.add("btn", "btn-outline-success", "message-provider-btn");
    messageButton.setAttribute("data-provider-id", provider._id);
    messageButton.textContent = "Message";
    card.querySelector(".card-body").appendChild(messageButton);

    return card;
}

  function createRatingCard(rating) {
    const card = document.createElement("div");
    card.classList.add("card", "mt-3");
  
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
  
    const title = document.createElement("h5");
    title.classList.add("card-title");
    title.textContent = `Rating: ${rating.rating}`;
  
    const review = document.createElement("p");
    review.classList.add("card-text");
    review.textContent = rating.review;
  
    cardBody.appendChild(title);
    cardBody.appendChild(review);
    card.appendChild(cardBody);
  
    return card;
  }