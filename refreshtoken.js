const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Promise = require('bluebird')

const schema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  token: String,
  expiresAt: Number,
  confirmed: {
    type: Boolean,
    default: false,
  },
  role: 
    {
      type: String,
      default: 'customer',
      emum: [
        'customer',
        'administrator',
        'employee'
      ]
    }
}, {
  collection: 'user',
  timestamps: true
})

schema.set('toJSON', { getters: true });
schema.set('toObject', { getters: true });

schema.methods.generateAuthToken = async function () {
  const user = this
  const userCopied = user.toJSON();

  delete userCopied.password;
  delete userCopied.token;

  const token = jwt.sign({user: userCopied}, "somethingyoudontknow", {expiresIn: "1d"})
  return token
}

schema.methods.generateRefreshToken = async function () {
  let dayExpire = "10";
  let secondsExpire = dayExpire * 24 * 60 * 60;
  const expiresAt  = Date.now() / 1000 + secondsExpire;
  const user = this
  const token = jwt.sign({_id: user._id}, "refresh")
  user.token = token;
  user.expiresAt = expiresAt;
  await user.save();
  return token
}


schema.methods.isValidPassword = function isValidPassword(password, callback) {
  return Promise
    .resolve(bcrypt.compare(password, this.password))
    .asCallback(callback);
};

schema.pre('save', function preSave(next) {
  if (this.isModified('password')) {
    const that = this;

    return bcrypt.hash(this.password, 10, (err, hash) => {
      that.password = hash;
      return next();
    });
  }

  return next();
});


schema.methods.refreshTokenExpired = (time) => {
  const result = time > Date.now() / 1000 ?  false : true;
  return result;
}

module.exports = mongoose.model('User', schema);







instance.interceptors.response.use(
  (resp) => resp.data,
  (error) => {
    const { response } = error;
    if (response) {
      switch (response.status) {
        case 401:
          return getNewAccessToken().then(() => {
            const newtoken = localStorage.getItem("accessToken");
            error.config.headers["Authorization"] = Bearer ${newtoken};
            Promise.resolve(axios(error.config))
          });
          break;
        case 403:
        case 405:
        case 404:
        case 500:
        case 503:
          break;
        default:
          break;
      }
    } else {
      // history.push({
      //   pathname: "/login",
      //   state: {
      //     status: 500,
      //     statusText: "Internal Server Error",
      //   },
      // });
    }

    return Promise.reject(error);
  }
);




































