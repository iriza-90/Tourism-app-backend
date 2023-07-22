const router = require("express").Router();
const bcrypt = require("bcrypt");
const { User} = require("../models/signUp.model");
const authorize = require("../middleware/authorize");
const upLoaders = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");

// GET route to fetch all user data from the database
router.get('/', authorize, async (req, res) => {
  try {
    const userData = await User.findOne(
        { _id: req.user.id },
    );

    return res.status(200).send(userData);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.put('/', authorize, upLoaders, async (req, res) => {
    try {
        const { name, email, password, confirmPassword, termsAndConditions, isAdmin } = req.body;
        const photoUrl = req.file.path;
       

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(password, salt);
        if(password !== confirmPassword){
            return res.status(400).send({message: "Passwords do not match"});
        }
         const result = await cloudinary.uploader.upload(photoUrl);
        const photo = result.url;
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
                name,
                email,
                password: hashPassword,
                confirmPassword: hashPassword,
                termsAndConditions,
                isAdmin,
                photo
            },
            { new: true }
        );
        return res.status(200).send(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;
