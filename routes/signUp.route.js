const router = require("express").Router();
const { User, validate } = require("../models/signUp.model");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const upLoaders = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");
const path = require("path")
// const sendVerificationEmail = require("../utils/sendEmail")

// Middleware to upload images
// ...

router.post("/", upLoaders, async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const { name, email, password, confirmPassword, termsAndConditions } = req.body;
    const photoPath = req.file.path;
    const result = await cloudinary.uploader.upload(photoPath);
   // console.log(photoPath, result)
    const photo = result.url; 

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ message: "User with given email already exists!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).send({ message: "Passwords do not match" });
    }

  
  

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await new User({
      name,
      email,
      password: hashPassword,
      confirmPassword: hashPassword,
      termsAndConditions,
      photo,
    }).save();

    // Sending verification email
    // sendVerificationEmail(newUser, res);

    const token = await new Token({
      userId: newUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const url = `${process.env.BASE_URL}/users/${newUser._id}/verify/${token.token}`;
    await sendEmail(newUser.email, "Verify Email", url);

    res.status(201).send({ message: "An Email sent to your account. Please verify." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Email verification
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



// router.get("/verify/:userId/:uniqueString" , (req,res)=>{
//   let{userId, uniqueString} = req.params

//   userVerification
//   .find({userId})
//   .then((result)=>{
//     if(result.length>0){
//       const {expiresAt} = result[0]
//       const hashedUniqueString= result[0].uniqueString
//       if(expiresAt < Date.now()){
//         userVerification
//         .deleteOne({userId})
//         .then(result =>{
//           User.deleteOne({_id:userId})
//           .then(result =>{
//             let message = "Link has expired .Please sign up again"
//             res.redirect(`/user/verified/error=true&message=${message}`)
//           })
//           .catch(error =>{
//             let message = "Clearing user with expires unique string failed"
//             res.redirect(`/user/verified/error=true&message=${message}`)
//           })
//         })
//         .catch((error)=>{
//           console.log(error)
//           let message = "An error occured while clearing expired user verification record"
//           res.redirect(`/user/verified/error=true&message=${message}`)
          
//         })
//       }else{
// bcrypt
// .compare(uniqueString,hashedUniqueString)
// .then(result =>{
//   if(result){
//     User
//     .updateOne({_id:userId},{verified:true})
//     .then(()=>{
//       userVerification
//       .deleteOne({userId})
//       .then(()=>{
// res.send("Your email verification has been finalized successfully")
//       })
//       .catch(error =>{
//         console.log(error)
//         let message = "An error occured while finalizing successful verification"
//         res.redirect(`/user/verified/error=true&message=${message}`)
//       })
//     })
//     .catch(error =>{
//       console.log(error)
//       let message = "An error occured while updating user record to show verified"
//       res.redirect(`/user/verified/error=true&message=${message}`)
//     })
//   }
//   else{
//     let message = "Invalid verification details passed . check your inbox"
//     res.redirect(`/user/verified/error=true&message=${message}`)
//   }
// })
// .catch(error =>{
//   let message = "An error occured while comparing strings"
//   res.redirect(`/user/verified/error=true&message=${message}`)
// })
//       }

//     }else{
//       let message = "Account record doesn't exist or has been verified already. Please sign up or login"
//       res.redirect(`/user/verified/error=true&message=${message}`)
//     }
//   })
//   .catch((error)=>{
//     console.log(error)
//     let message = "An error occured while checking for existing user verification record"
//     res.redirect(`/user/verified/error=true&message=${message}`)
//   })
// })

// router.get("/verified" , (req,res)=>{
//   const message = `Hello, your email has been verified successfully!`;

//   res.status(200).json({ message: message });

// })



module.exports = router;
