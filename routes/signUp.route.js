const router = require("express").Router();
const { User, validate } = require("../models/signUp.model");
const Token = require("../models/token");
const crypto = require("crypto");
// const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
const {v4: uuidv4} = require("uuid")

require("dotenv").config()

// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth:{
//     user: process.env.USER,
//     pass:process.env.PASS,
//   }
// })








let sendEmail = async (email, subject, text) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Ready for messages");
        console.log(success);
      }
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Email sent Successfully");
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
  }
};


router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const { name, email, password, confirmPassword, termsAndConditions, isAdmin } = req.body;

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
      isAdmin,
    }).save();
 

    const token = await new Token({
      userId: newUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const url = `${process.env.BASE_URL}users/${newUser._id}/verify/${token.token}`;
    await  sendEmail(newUser.email, "Verify Email", url);

    res.status(201).send({ message: "An Email sent to your account please verify" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});



  

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

router.post("/signin", (req,res)=>{
  let{email,password} = req.body
  email = email.trim()
  password= password.trim()

  if(email == "" || password == ""){
    res.json({
      status:"FAILED",
      message:"Empty credentials supplied"
    })
  }else{
    User.find({email})
    .then(data =>{
      if(data){
        const hashedPassword = data[0].password
        bcrypt.compare(password,hashedPassword).then(result =>{
          if(result){
            res.json({
              status:"SUCCESS",
              message:"Signin successfully",
              data:data
            })
          }else{
            res.json({
              status:"FAILED",
              message:"Invalid password entered!"
            })
          }
        }).catch(err =>{
          res.json({
            status:"FAILED",
            message:"An error occured while comparing passwords"
          })
        })
      }else{
        res.json({
          status:"FAILED",
          message:"Invalid credentials enterd!"
        })
      }
    }).catch(err =>{
      res.json({
        status:"FAILED",
        message:"An error occured while checking for existing user"
      })
    })
  }
})

module.exports = router;
