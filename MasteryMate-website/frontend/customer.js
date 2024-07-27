document.addEventListener("DOMContentLoaded", () => {

  // Get all navigation links
const navLinks = document.querySelectorAll(".nav-link");

// Add click event listener to each nav link
navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent the default link behavior

    // Remove the "active" class from all nav links
    navLinks.forEach((link) => link.classList.remove("active"));

    // Add the "active" class to the clicked nav link
    event.target.classList.add("active");

    // Get the section to show based on the data-section attribute
    const sectionId = event.target.getAttribute("data-section");
    const section = document.getElementById(sectionId);

    // Hide all sections
    const sections = document.querySelectorAll("section");
    sections.forEach((sec) => sec.classList.remove("active"));

    // Show the corresponding section
    section.classList.add("active");
  });
});

  // Handle "Book Appointment" button click
const providerCardContainer = document.getElementById("provider-card-container");
providerCardContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("book-appointment-btn")) {
    const providerId = event.target.dataset.providerId;
    console.log(`Book appointment button clicked for provider with ID: ${providerId}`);
    showBookingModal(providerId);
  }
});

  // Close booking appointment modal
  const modal = document.getElementById("bookAppointmentModal");
  const closeBtn = document.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none"; // Hide the modal
  });

  // Close the modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Load tasks and messages using fetch
  fetch("/tasks")
    .then((response) => response.json())
    .then((data) => {
      const tasksTableBody = document.getElementById("tasks-table-body");
      data.forEach((task) => {
        tasksTableBody.appendChild(createTaskRow(task));
      });
    })
    .catch((error) => {
      console.error("Error loading tasks:", error);
    });

  fetch("/messages")
    .then((response) => response.json())
    .then((data) => {
      const messagesTableBody = document.getElementById("messages-table-body");
      data.forEach((message) => {
        messagesTableBody.appendChild(createMessageRow(message));
      });
    })
    .catch((error) => {
      console.error("Error loading messages:", error);
    });

  // Load messages on page load
  refreshMessages();

  // Load all providers on page load
  loadAllProviders();

  // Create a new task
  const createTaskForm = document.getElementById("create-task-form");
  if (createTaskForm) {
    createTaskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = document.getElementById("create-task-title").value;
      const description = document.getElementById("create-task-description").value;
      const category = document.getElementById("create-task-category").value;
      const budget = document.getElementById("create-task-budget").value;
      createTask(title, description, category, budget)
        .then(() => {
          refreshTasks();
        })
        .catch((error) => {
          console.error("Error creating task:", error);
        });
    });
  }

  // Search for providers
  const searchProviderBtn = document.getElementById("search-provider-btn");
  if (searchProviderBtn) {
    searchProviderBtn.addEventListener("click", () => {
      const searchInput = document.getElementById("search-provider-input").value;
      searchProviders(searchInput);
    });
  }

  // Attach event listener to message buttons using event delegation
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("message-provider-btn")) {
      const providerId = event.target.dataset.providerId;
      console.log(`Message button clicked for provider with ID: ${providerId}`);
      const messageContent = prompt("Enter your message:");
      if (messageContent) {
        sendMessage(providerId, messageContent);
      }
    }
  });

  // // Book appointment button click event
  // const providerCardContainer = document.getElementById("provider-card-container");
  // if (providerCardContainer) {
  //   providerCardContainer.addEventListener("click", (event) => {
  //     if (event.target.classList.contains("book-appointment-btn")) {
  //       const providerId = event.target.dataset.providerId;
  //       console.log(`Book appointment button clicked for provider with ID: ${providerId}`);
  //       $('#bookAppointmentModal').modal('show');
  //       document.getElementById("appointment-provider-id").value = providerId;
  //     }
  //   });
  // }

  // Handle appointment booking form submission
const bookAppointmentForm = document.getElementById("bookAppointmentForm");
if (bookAppointmentForm) {
  bookAppointmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const providerId = document.getElementById("appointment-provider-id").value;
    const customerName = document.getElementById("appointment-customer-name").value;
    const title = document.getElementById("appointment-title").value;
    const description = document.getElementById("appointment-description").value;
    const location = document.getElementById("appointment-location").value;
    const budget = document.getElementById("appointment-budget").value;
    const date = document.getElementById("appointment-date").value; // Get date value
    const time = document.getElementById("appointment-time").value; // Get time value
    bookAppointment(providerId, customerName, title, description, location, budget, date, time)
      .then(() => {
        const modal = document.getElementById("bookAppointmentModal");
        modal.style.display = "none"; // Hide the modal
        alert("Appointment booked successfully!");
      })
      .catch((error) => {
        console.error("Error booking appointment:", error);
      });
  });
}

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
            window.location.href = response.url;
          }
        })
        .catch((error) => {
          console.error("Error logging out:", error);
          alert("Error logging out. Please try again.");
        });
    });
  }
});

  // Show booking appointment modal
  function showBookingModal(providerId) {
    const modal = document.getElementById("bookAppointmentModal");
    const providerIdInput = document.getElementById("appointment-provider-id");
    providerIdInput.value = providerId;
    // Center the modal on the screen
  modal.style.display = "block";
  modal.style.top = `calc(50% - ${modal.offsetHeight / 2}px)`;
  modal.style.left = `calc(50% - ${modal.offsetWidth / 2}px)`;
  }

async function loadAllProviders() {
  try {
    // Fetch all providers
    const response = await fetch(`/providers`);
    const providers = await response.json();

    // Display provider cards
    const providerCardContainer = document.getElementById("provider-card-container");
    providerCardContainer.innerHTML = ""; // Clear previous providers
    providers.forEach((provider) => {
      const card = createProviderCard(provider);
      providerCardContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading providers:", error);
  }

  //   // Fetch appointments made by the current customer
  //   const appointmentsResponse = await fetch(`/appointments/`);
  //   const appointments = await appointmentsResponse.json();

  //   // Display appointments made by the current customer
  //   const appointmentsContainer = document.getElementById("customer-appointments");
  //   appointmentsContainer.innerHTML = ""; // Clear previous appointments
  //   appointments.forEach((appointment) => {
  //     const appointmentElement = createAppointmentElement(appointment);
  //     appointmentsContainer.appendChild(appointmentElement);
  //   });
  // } catch (error) {
  //   console.error("Error loading providers and appointments:", error);
  // }
}

function createAppointmentElement(appointment) {
  const appointmentElement = document.createElement("div");
  appointmentElement.classList.add("appointment-card", "card", "mb-3", "shadow-sm", "col-md-4"); // Changed to col-md-4 for 3 columns
  appointmentElement.innerHTML = `
    <div class="card-body d-flex flex-column">
      <h5 class="card-title text-primary">${appointment.title}</h5>
      <p class="card-text mb-auto">${appointment.description}</p>
      <ul class="list-group list-group-flush flex-grow-1">
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span class="fw-bold">Location:</span>
          <span>${appointment.location}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span class="fw-bold">Budget:</span>
          <span>${appointment.budget}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span class="fw-bold">Date:</span>
          <span class="badge bg-primary">${appointment.date}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span class="fw-bold">Time:</span>
          <span class="badge bg-info">${appointment.time}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span class="fw-bold">Status:</span>
          <span class="badge bg-${appointment.status === 'accepted' ? 'success' : appointment.status === 'rejected' ? 'danger' : 'warning'} text-white">${appointment.status}</span>
        </li>
      </ul>
    </div>
  `;
  return appointmentElement;
}

// Function to book an appointment
async function bookAppointment(providerId, customerName, title, description, location, budget, date, time) {
  try {
    const response = await fetch("/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providerId,
        customerName,
        title,
        description,
        location,
        budget,
        date,
        time,
      }),
    });

    if (response.ok) {
      console.log("Appointment booked successfully");
      $('#bookAppointmentModal').modal('hide');

      // Wait for appointment data fetch before showing alert
      const appointment = await response.json(); 

      const appointmentElement = createAppointmentElement(appointment);
      const appointmentsContainer = document.getElementById("customer-appointments");
      appointmentsContainer.appendChild(appointmentElement);
    } else {
      console.error("Failed to book appointment");
    }
  } catch (error) {
    console.error("Error booking appointment:", error);
  }
}

// Function to send message to a provider
async function sendMessage(providerId, content, senderMastery) {
  try {
    // You can replace this with your actual endpoint and payload structure
    const response = await fetch("/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId: "customer", // Assuming the sender is the customer
        receiverId: providerId,
        content: content,
        senderMastery: senderMastery || null, // Add senderMastery property
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

// JavaScript
async function searchProviders(keyword) {
  try {
    const response = await fetch(`/search/providers?keyword=${keyword}`);
    const providers = await response.json();

    const searchResultsContainer = document.getElementById("search-results");
    searchResultsContainer.innerHTML = "";

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const card = createProviderCard(provider);
      searchResultsContainer.appendChild(card);
    }
  } catch (error) {
    console.error("Error searching for providers:", error);
  }
}

function createProviderCard(provider) {
  const card = document.createElement("div");
  card.classList.add('card', 'shadow-lg', 'col-md-4', 'col-lg-3');
  card.innerHTML = `
      <div class="card-body">
          <h5 class="card-title text-center mb-4">${provider.username}</h5>
          <p class="card-text text-center mb-3">${provider.role}</p>
          <hr class="border-top border-primary border-3 mb-4">
          ${
              provider.role === 'service_provider'
              ? `<p class="card-text"><strong>Mastery:</strong> ${provider.mastery}</p>`
              : ''
          }
          <p class="card-text mb-3"><strong>Location:</strong> ${provider.location}</p>
          <p class="card-text mb-3"><strong>Experience:</strong> ${provider.experience}</p>
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
  messageButton.classList.add("message-provider-btn");
  messageButton.setAttribute("data-provider-id", provider._id);
  messageButton.textContent = "Message";
  card.querySelector(".card-body").appendChild(messageButton);

  if (provider.role === 'service_provider') {
    const bookAppointmentButton = document.createElement("button");
    bookAppointmentButton.classList.add("book-appointment-btn");
    bookAppointmentButton.setAttribute("data-provider-id", provider._id);
    bookAppointmentButton.textContent = "Book Appointment";
    bookAppointmentButton.addEventListener("click", () => {
      showBookingModal(provider._id);
    });
    card.querySelector(".card-body").appendChild(bookAppointmentButton);
  }

  return card;
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

// async function markMessageAsRead(messageId) {
//   try {
//     const response = await fetch(`/messages/${messageId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ status: "read" }),
//     });

//     if (response.ok) {
//       // Refresh messages after marking a message as read
//       refreshMessages();
//     } else {
//       console.error("Failed to mark message as read");
//     }
//   } catch (error) {
//     console.error("Error marking message as read:", error);
//   }
// }
function refreshMessages() {
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
  row.innerHTML = `
    <td>${message.senderId === 'customer' ? message.senderId : `Service Provider (${message.senderMastery})`}</td>
    <td>${message.content}</td>
    <td>${message.status}</td>
    <td>${message.senderId === 'customer' ? '' : message.status === 'read' ? '' : `<button class="btn btn-primary mark-as-read-btn" data-message-id="${message._id}">Mark as Read</button>`}</td>
  `;

  const markAsReadBtn = row.querySelector('.mark-as-read-btn');
  if (markAsReadBtn) {
    markAsReadBtn.addEventListener('click', () => {
      const messageId = markAsReadBtn.dataset.messageId;
      markMessageAsRead(messageId, row);
    });
  }

  return row;
}

async function markMessageAsRead(messageId, messageRow) {
  try {
    const response = await fetch(`/messages/${messageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "read" }),
    });

    if (response.ok) {
      const markAsReadBtn = messageRow.querySelector('.mark-as-read-btn');
      if (markAsReadBtn) {
        markAsReadBtn.remove();
      }
      refreshMessages();
    } else {
      console.error("Failed to mark message as read");
    }
  } catch (error) {
    console.error("Error marking message as read:", error);
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

// function createMessageRow(message) {
//   const row = document.createElement("tr");
//   row.innerHTML = `
//         <td>${message.senderId === 'customer' ? message.senderId : `Service Provider (${message.senderMastery})`}</td>
//         <td>${message.content}</td>
//         <td>${message.status}</td>
//         <td>
//         ${message.senderId === 'customer' ? '' : `<button class="btn btn-primary mark-as-read-btn" data-message-id="${message._id}">Mark as Read</button>`}
//         </td>
//     `;

//     const markAsReadBtn = row.querySelector('.mark-as-read-btn');
//     if (markAsReadBtn) {
//         markAsReadBtn.addEventListener('click', () => {
//             const messageId = markAsReadBtn.dataset.messageId;
//             markMessageAsRead(messageId).then(() => {
//                 refreshMessages();
//             });
//         });
//     }

//     return row;
// }


