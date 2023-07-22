const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function (value) {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value);
      },
      message: 'Invalid email format',
    },
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ContactMessage = mongoose.model("ContactMessage", contactSchema);

module.exports = ContactMessage;
