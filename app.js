const express = require('express');
const path = require("path");
const ejsMate = require("ejs-mate");
const app = express();
var session = require('express-session');
app.use(session({secret:"None" , resave:true , saveUninitialized:true}));
const multer = require('multer')
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + '/public'));

var hotelCreateRouter = require('./routes/hregister_submit');
app.use('/hregister_submit',hotelCreateRouter);
var dashboardDetails = require('./routes/dashboard_retreive');
app.use('/dashboard_retreive',dashboardDetails)
var custCreateRouter = require('./routes/custregister_submit');
const { isSymbolObject } = require('util/types');
app.use('/custregister_submit', custCreateRouter);
var hotelDisplayRouter = require('./routes/display_hotels');
app.use('/display_hotels',hotelDisplayRouter);

app.get("/", (req, res) => {    
    let isloggedIn = false;
    isloggedIn = req.session.valid;
    let userData = req.session.userData;
    res.render("home" , {isloggedIn , userData});
});
app.get("/login" , (req , res) => {
    let lobj = {
        loginCorrect:true , 
        initialLogin:true , 
        numTriesExceeded:false
    };
    req.session.num_of_tries = 0;
    res.render("login" , lobj);
});
app.get("/decsignup" , (req , res) => {
    res.render("decsignup");
});
app.get("/hregister" , (req , res) => {
    res.render("hregister");
});
app.get("/user_signup" , (req , res) => {
    res.render("user_signup");
});
app.listen(3000, () => {
    console.log("Listening on port 3000...");
});
