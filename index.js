const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const signUpRoute = require("./routes/signUp.route");
const travelRoute = require("./routes/booking.route");
const logInRoute = require("./routes/login.route");
const userRoute = require("./routes/user.router");
const contactRoute = require("./routes/contact.router");

const PORT = process.env.PORT || 5000;

dotenv.config({ path: "./.env" });
//TODO: after updating the db check if everything is working fine
//middleware
app.use(express.json());
app.use(cors()); // allowing external app to access the api
app.use(morgan("dev")); // log the request in the console

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => console.log("Connected to database successfully"))
  .catch((err) => console.log(err));

app.use("/users", signUpRoute);
app.use("/user", userRoute);
app.use("/login", logInRoute);
app.use("/travels", travelRoute);
app.use("/contact", contactRoute);

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
