const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

// Initialize Express app
const app = express();
const port = 3000; // You can change the port if needed
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB connection URI (replace with your MongoDB connection string)
const mongoURI = "mongodb://localhost:27017";
const dbName = "masterymate";

// Connect to MongoDB
async function connectToDB() {
  try {
    const client = await MongoClient.connect(mongoURI);
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the app on connection failure
  }
}

// Call the connection function to establish connection on startup
connectToDB();

// Serve static files from the public directory
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Define routes to render HTML templates
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html")); // Use path.join to construct the file path
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "signup.html")); // Use path.join to construct the file path
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "login.html")); // Use path.join to construct the file path
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "about.html")); // Use path.join to construct the file path
});

app.get("/customer-profile", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "customer-profile.html"));
});

app.get("/customer-profile", (req, res) => {
  res.redirect("/customer-profile.html");
});

app.get("/provider-dashboard", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "frontend", "provider-dashboard.html")
  );
});

app.get("/provider-dashboard", (req, res) => {
  res.redirect("/provider-dashboard.html");
});

// Logout route
app.get("/logout", (req, res) => {
  // Redirect to the home page or login page after logout
  res.redirect("/");
});

// Search Providers route
app.get("/search/providers", async (req, res) => {
  try {
    const keyword = req.query.keyword;

    // Convert keyword to a string if it's not already
    const searchString =
      typeof keyword === "string" ? keyword : String(keyword);

    // Search for providers in MongoDB
    const providers = await db
      .collection("users")
      .find({
        role: "service_provider",
        location: { $regex: searchString, $options: "i" },
      })
      .toArray();

    res.json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get All Providers route
app.get("/providers", async (req, res) => {
  try {
    // Retrieve all providers from MongoDB
    const providers = await db
      .collection("users")
      .find({ role: "service_provider" })
      .toArray();
    res.json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Book Appointment route
app.post("/appointments", async (req, res) => {
  try {
    const {
      providerId,
      customerName,
      title,
      description,
      location,
      budget,
      date,
      time,
    } = req.body;

    // Store appointment data in MongoDB
    const result = await db.collection("appointments").insertOne({
      providerId,
      customerName,
      title,
      description,
      location,
      budget,
      date,
      time,
      status: "pending", // Initial status is 'pending'
    });

    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get All Appointments route
app.get("/appointments", async (req, res) => {
  try {
    // Retrieve all appointments from MongoDB
    const appointments = await db.collection("appointments").find().toArray();
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get Appointments by Provider ID route
app.get("/appointments/provider/:providerId", async (req, res) => {
  try {
    const providerId = req.params.providerId;

    // Retrieve appointments for a specific provider from MongoDB
    const providerAppointments = await db
      .collection("appointments")
      .find({ providerId })
      .toArray();
    res.json(providerAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get Appointments by Customer Name route
app.get("/appointments/:customerName", async (req, res) => {
  try {
    const customerName = req.params.customerName;

    // Retrieve appointments for a specific customer from MongoDB
    const customerAppointments = await db
      .collection("appointments")
      .find({ customerName })
      .toArray();
    res.json(customerAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Update Appointment Status route
app.put("/appointments/:id/status", async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body;

    // Update appointment status
    await db
      .collection("appointments")
      .updateOne({ _id: new ObjectId(appointmentId) }, { $set: { status } });

    res.send("Appointment status updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete Appointment route
app.delete("/appointments/:id", async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Delete appointment by ID
    await db
      .collection("appointments")
      .deleteOne({ _id: new ObjectId(appointmentId) });

    res.send("Appointment deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Create Task route
app.post("/tasks", async (req, res) => {
  try {
    // Extract task details from request body
    const { title, description, category, budget } = req.body;

    // Store task data in MongoDB
    const result = await db.collection("tasks").insertOne({
      title,
      description,
      category,
      budget,
      status: "open", // Initial status is 'open'
    });

    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get All Tasks route
app.get("/tasks", async (req, res) => {
  try {
    // Retrieve all tasks from MongoDB
    const tasks = await db.collection("tasks").find().toArray();
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get Task by ID route
app.get("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    // Create a new ObjectId instance from the task ID
    const objectId = new ObjectId(taskId);
    // Find task by ID
    const task = await db.collection("tasks").findOne({ _id: objectId });

    if (!task) {
      return res.status(404).send("Task not found");
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Update Task route
app.put("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    // Create a new ObjectId instance from the task ID
    const objectId = new ObjectId(taskId);

    // Update task status
    await db
      .collection("tasks")
      .updateOne({ _id: objectId }, { $set: { status } });

    res.send("Task updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete Task route
app.delete("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    // Create a new ObjectId instance from the task ID
    const objectId = new ObjectId(taskId);
    // Delete task by ID
    await db.collection("tasks").deleteOne({ _id: objectId });

    res.send("Task deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Send Message route
app.post("/messages", async (req, res) => {
  try {
    // Extract message details from request body
    const { senderId, receiverId, content, senderMastery } = req.body;

    // Store message data in MongoDB
    const result = await db.collection("messages").insertOne({
      senderId,
      receiverId,
      content,
      senderMastery, // Store senderMastery
      status: "unread", // Initial status is 'unread'
    });

    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get All Messages route
app.get("/messages", async (req, res) => {
  try {
    // Retrieve all messages from MongoDB
    const messages = await db.collection("messages").find().toArray();
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get Messages by User ID route
app.get("/messages/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Retrieve messages for a specific user from MongoDB
    const messages = await db
      .collection("messages")
      .find({ receiverId: userId })
      .toArray();
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get Message by ID route
app.get("/messages/:id", async (req, res) => {
  try {
    const messageId = req.params.id;

    const objectId = new ObjectId(messageId);
    // Retrieve a specific message by its ID from MongoDB
    const message = await db.collection("messages").findOne({ _id: objectId });

    if (!message) {
      return res.status(404).send("Message not found");
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Update Message route
app.put("/messages/:id", async (req, res) => {
  try {
    const messageId = req.params.id;
    const { status } = req.body;

    const objectId = new ObjectId(messageId);
    // Update message status
    await db
      .collection("messages")
      .updateOne({ _id: objectId }, { $set: { status } });

    res.send("Message updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete Message route
app.delete("/messages/:id", async (req, res) => {
  try {
    const messageId = req.params.id;

    const objectId = new ObjectId(messageId);
    // Delete message by its ID
    await db.collection("messages").deleteOne({ _id: objectId });

    res.send("Message deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Submit Rating and Review route
app.post("/ratings", async (req, res) => {
  try {
    // Extract rating and review details from request body
    const { providerId, customerId, rating, review } = req.body;

    // Store rating and review data in MongoDB
    const result = await db.collection("ratings").insertOne({
      providerId,
      customerId,
      rating,
      review,
    });

    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get All Ratings and Reviews route
app.get("/ratings", async (req, res) => {
  try {
    // Retrieve all ratings and reviews from MongoDB
    const ratings = await db.collection("ratings").find().toArray();
    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get Ratings and Reviews by Service Provider ID route
app.get("/ratings/:providerId", async (req, res) => {
  try {
    const providerId = req.params.providerId;

    // Retrieve ratings and reviews for a specific service provider from MongoDB
    const providerRatings = await db
      .collection("ratings")
      .find({ providerId })
      .toArray();
    res.json(providerRatings);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Update Rating and Review route
app.put("/ratings/:id", async (req, res) => {
  try {
    const ratingId = req.params.id;
    const { rating, review } = req.body;

    const objectId = new ObjectId(ratingId);
    // Update rating and review
    await db
      .collection("ratings")
      .updateOne({ _id: objectId }, { $set: { rating, review } });

    res.send("Rating and review updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete Rating and Review route
app.delete("/ratings/:id", async (req, res) => {
  try {
    const ratingId = req.params.id;

    const objectId = new ObjectId(ratingId);
    // Delete rating and review by ID
    await db.collection("ratings").deleteOne({ _id: objectId });

    res.send("Rating and review deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get All Users route
app.get("/users", async (req, res) => {
  try {
    // Retrieve all users from MongoDB
    const users = await db.collection("users").find().toArray();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Search Users route
app.get("/search/users", async (req, res) => {
  try {
    const keyword = req.query.keyword;

    // Search for users in MongoDB based on keyword
    const users = await db
      .collection("users")
      .find({ username: { $regex: keyword, $options: "i" } })
      .toArray();

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { username, password, role, mastery, location, experience } =
      req.body;

    // Check if username is already taken
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username is already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare the user data object
    const userData = {
      username,
      password: hashedPassword,
      role,
      location,
    };

    // Add the mastery field only if the role is 'service_provider'
    if (role === "service_provider") {
      userData.mastery = mastery;
      userData.experience = experience;
    }

    // Store user data in MongoDB
    await db.collection("users").insertOne(userData);

    res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    // Extract username and password from request body
    const { username, password } = req.body;

    // Find user by username
    const user = await db.collection("users").findOne({ username });

    // If user not found or password doesn't match, return error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    // If login is successful, return user's role
    res.json({ success: true, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
