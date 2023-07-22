const router = require("express").Router();
const bcrypt = require("bcrypt");
const { User} = require("../models/signUp.model");
const JwtGenerator = require("../utils/JwtGenerator");
const authorize = require("../middleware/authorize");
const sendEmail = require("../utils/sendEmail");

//FIXME: I think this file needs to go inside in signUp.route.js
router.post("/" , async (req, res)=>{
try {
    const {email, password} = req.body;
    
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(409).send({message: "User with given email already exists!"});
    }
   

    const validPassword = await bcrypt.compare(password, existingUser.password);
    
    if(!validPassword){
        return res.status(401).send({message: "Invalid password"});
    }
    const playLoad = {
        user:{
            id: existingUser._id
        }
    }
    const jwtToken = JwtGenerator(playLoad);
    res.status(201).send({jwtToken});  
} catch (error) {
  res.status(500).send({ message: "Internal Server Error" });
}

})

router.post("/forget", async(req, res)=>{
   try {
    const {email} = req.body;
    const existingUser = User.findOne({email});
    if(existingUser){
        const playLoad ={
            user:{
                email: existingUser.email,
                id: existingUser._id
        }
    }
            const token = JwtGenerator(playLoad);
            const url = `${process.env.BASE_URL}/${existingUser._id}/reset/${token}`;
            await sendEmail(email, "Reset Password", url);

    }
   } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
   }

})

router.post("/reset/:id/:token", async(req, res)=>{
    try {
        const {id, token} = req.params
        const {password, confirmPassword} = req.body;
        const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(400).send({ message: "Invalid link" });
    }
     if (password !== confirmPassword) {
        return res.status(400).send({ message: "Passwords do not match" });
    }
    const playLoad = jwt.verify(token, process.env.JWT_SECRET);
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(password, salt);

    const update = await User.findOneAndUpdate(
        { _id: id },
        { password: hashPassword,
        confirmPassword: hashPassword,
        }
        );

        res.status(200).send({message: "Password updated successfully"});
    } catch (error) {
        
    }
})
 


router.post('/verify', authorize, (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



module.exports = router;
