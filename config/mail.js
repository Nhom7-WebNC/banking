let mail = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    SSL: true,
    auth: {
        // should be replaced with real sender's account
        user: 'phongcoi696@gmail.com',
        pass: 'phongcoi69'
    }
    
};
module.exports = mail;