//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require ('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Added bcrypt for password hashing

const app = express();

console.log(process.env.API_KEY);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded ({
    extended:true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
    email:String,
    password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home")
});

app.get("/login", function(req, res){
    res.render("login")
});


app.get("/register", function(req, res){
    res.render("register")
});

app.get("/logout", function(req, res){
    if (req.user && req.user.username) { // Check if the user is logged in
        const username = req.user.username; // Access username
        req.session.destroy(function(err) {
            if(err) {
                console.log(err);
            }
            res.render("logout", { username: username });
        });
    } else {
        res.redirect("/login"); // Redirect to login if user is not logged in
    }
});




app.post("/register", async function(req, res){ 
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password
        const newUser = new User({
            email: req.body.username,
            password: hashedPassword
        });
        await newUser.save();
        res.render("secrets");
    } catch (err) {
        console.log(err);
    }
});

app.post("/login", async function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({email: username});

        if (foundUser && foundUser.password === password) {
            res.render("secrets");
        } else {
            res.render("error", { errorMessage: "Invalid username or password" }); 
        }
    } catch (err) {
        console.log(err);
        res.render("error", { errorMessage: "An error occurred" }); 
    }
});


app.use((req, res, next) => {
    res.status(404).send("Sorry, we couldn't find that page!");
  });
  
  


app.listen(3000, function() {
    console.log('server started on port 3000.')
});
