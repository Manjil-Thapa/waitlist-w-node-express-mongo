const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const ExpressError = require("./utilities/ExpressError");
const catchAsync = require("./utilities/catchAsync");
const path = require("path");

const port = 3000;
const app = express();

// Connecting Database
// mongoose.set('strictQuery', false);
// mongoose.connect('mongodb://127.0.0.1:27017/mywaitlist');
//   .then(() => {
//     console.log('MongoDB connected')
//   })
//   .catch((e) => {
//     console.log('MongoDb connection error')
//     console.log(e)
//   })

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/mywaitlist";
mongoose.connect(dbUrl, {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

//Configuring Express
app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Routes

app.get("/", (req, res) => {
  res.render("home"); // render the new home template
});

app.get(
  "/waitlist/:id",
  catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render("confirmation", { user });
  })
);
// prevent users from registering with a duplicate email address
app.post(
  "/register",
  catchAsync(async (req, res) => {
    if (!req.body.email) {
      res.render("home", { error: "Email cannot be empty" }); // still need some server side validations because requierd alone will not be sufficient
      return;
    }
    let foundUser = await User.findOne({ email: req.body.email }); // name attribute on the form input is set to “email”, you’ll find the data inside of req.body.email
    if (foundUser) {
      res.render("home", { error: "That email is already on the waitlist" }); // prevent users from registering with a duplicate email address
      return;
    }
    // newUser object should now include a position property, thanks to the mongoose-sequence plugin
    const newUser = new User({ email: req.body.email });
    await newUser.save();
    res.redirect(`/waitlist/${newUser._id}`); // include the newly created user’s id when redirecting
  })
);

// Implement the 404 “catch all” route

app.all("*", (req, res, next) => {
  throw new ExpressError("Page Not Found", 404);
});

// Express error handler

app.use((err, req, res, next) => {
  //catching errors that may be thrown from inside of async functions! For any non-404 error set the statusCode to a generic 500 and the message to “Oh No, Something Went Wrong!”
  if (err.statusCode !== 404) {
    err.statusCode = 500;
    err.message = "Oh No, Something Went Wrong!";
  }
  res.status(err.statusCode).render("error", { err }); // Use the statusCode from the error to set the response status code. Then render the error template, passing error message to the template.
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
