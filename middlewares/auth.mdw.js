const jwt = require ('jsonwebtoken');
const craeteError = require ('http-errors');

const config = require('../config/default.json');

module.exports = function  (req,res,next ) {
    const token = req.headers['x-access-token'];
    if (token){
        jwt.verify(token , config.auth.secret , function ( err,payload){
            if (err)
            throw craeteError(401,err);

            req.tokenPayLoad = payload ;
            next();
        })
    } else {
        throw craeteError(401, ' No accessToken found');
    }
}