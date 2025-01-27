const express = require("express");
const upload = require("./upload"); // Your multer configuration
const router = express.Router();

// Endpoint to upload a photo during registration (or any CRUD operation)
router.post("/signup", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  // Save the file info to your database (MongoDB)
  const photoUrl = `/uploads/${req.file.filename}`; // Save relative path to the photo

  // Continue with the registration logic and save the photo URL in the user model
  // User.create({ ...req.body, photo: photoUrl })
  res.status(200).send({ message: "User registered successfully", photoUrl });
});

module.exports = router;
