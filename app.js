var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {              
  res.json('Welcome to TTS Banking RSA!\n #Update to Tuesday, 26/05/2020');
});
  
// app.use('/', indexRouter);
// app.use('/users', usersRouter);



// app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/accounts', require('./routes/accountRoute'));
app.use('/api/users', require('./routes/userRoute'));




// catch 404 and forward to error handler
app.use((req, res, next) => {              // default route
  res.status(404).send('NOT FOUND');
})



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



const PORT = process.env.PORT ||3000;
app.listen(PORT,()=>{
    console.log(`API is running at http://localhost:${PORT}`)});




