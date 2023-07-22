const express = require("express");
const router = express.Router();
const ContactMessage = require("../models/contact.model");

router.post("/contact", async (req, res) => {
  try {
    const { userId, message } = req.body;

    const newMessage = await new ContactMessage({
      userId,
      message,
    }).save();

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/contact", async (req, res) => {
  try {
    // Retrieve all contact messages from the database
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE route to delete a contact message by ID
router.delete("/contact/:id", async (req, res) => {
  try {
    const messageId = req.params.id;

    const message = await ContactMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await message.remove();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
