const express = require("express");
const router = express.Router();
const ContactMessage = require("../models/contact.model");

router.post("/", async (req, res) => {
    try {
      const { firstName, lastName, email, message } = req.body;
  
      const newMessage = await new ContactMessage({
        firstName,
        lastName,
        email,
        message,
      }).save();
  
      res.status(201).json({ message: "Message sent successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.get("/", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
    try {
      const messageId = req.params.id;
  
      const message = await ContactMessage.findByIdAndRemove(messageId);
  
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
  
      res.status(200).json({
        message: "Message deleted successfully",
        firstName: message.firstName,
        lastName: message.lastName,
        email: message.email,
        message: message.message,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

module.exports = router;
