const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");

const port = 3000;
const app = express();

// Connecting Database
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/waitlist";
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
  res.render("home");
});

app.get(
  "/waitlist/:id",
  catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render("confirmation", { user });
  })
);

app.post(
  "/register",
  catchAsync(async (req, res) => {
    const newUser = new User({ email: req.body.email });
    await newUser.save();
    res.redirect(`/waitlist/${newUser._id}`);
  })
);

// Implement the 404 “catch all” route
app.all("*", (req, res, next) => {
  throw new ExpressError("Page Not Found", 404);
});

// Use the statusCode from the error to set the response status code. Then render the error template, passing error message to the template.
app.use((err, req, res, next) => {
  //catching errors that may be thrown from inside of async functions! For any non-404 error set the statusCode to a generic 500 and the message to “Oh No, Something Went Wrong!”
  if (err.statusCode !== 404) {
    err.statusCode = 500;
    err.message = "Oh No, Something Went Wrong!";
  }
  res.status(err.statusCode).render("error", { err });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
