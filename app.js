var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const passport = require("passport");
var flash = require("connect-flash");
const bodyParser = require("body-parser");
var session = require("express-session");

require("./config/passport")(passport);
var app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname + "../public"));

app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static("public"));
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.json("Phong Le 1206");
});
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// app.use('/api/auth', require('./routes/auth.route'));
app.use("/api/accounts", require("./routes/accountRoute"));
app.use("/api/users", require("./routes/userRoute"));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  // default route
  res.status(404).send("NOT FOUND");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.use(
  session({
    secret: "work hard",
    resave: true,
    saveUninitialized: false,
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API is running at http://localhost:${PORT}`);
});
