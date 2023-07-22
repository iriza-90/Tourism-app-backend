const router = require("express").Router();
const { User, validate } = require("../models/signUp.model");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const upLoaders = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");
// middleware to upload images
router.post("/", upLoaders, async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error) {
        return res.status(400).send({ message: error.details[0].message });
      }
      
      const { name, email, password, confirmPassword, termsAndConditions, isAdmin } = req.body;
      const photoUrl = req.file.path;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).send({ message: "User with given email already exists!" });
      }
  
      if (password !== confirmPassword) {
        return res.status(400).send({ message: "Passwords do not match" });
      }

      const  result = await cloudinary.uploader.upload(photoUrl);
      const photo = result.url;
  
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(password, salt);
  
      const newUser = await new User({
        name,
        email,
        password: hashPassword,
        confirmPassword: hashPassword, 
        termsAndConditions,
        isAdmin,
        photo
      }).save();
  
      const token = await new Token({
        userId: newUser._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
  
      const url = `${process.env.BASE_URL}/users/${newUser._id}/verify/${token.token}`;
      await sendEmail(newUser.email, "Verify Email", url);
  
      res.status(201).send({ message: "An Email sent to your account please verify" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });
  
// email verification
router.get("/:id/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).send({ message: "Invalid link" });
    }

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) {
      return res.status(400).send({ message: "Invalid link" });
    }

    await User.updateOne({ _id: user._id }, { verified: true }); 
    await token.remove();

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
