const receiverModel =require('../models/receiverModel');
module.exports = {
    add: async function(req,res,next){
        const newReceiver ={
            user_id: req.body.user_id,
            name: req.body.name,
            account_number: req.body.account_number,
            bank_code: req.body.bank_code
        }
        receiverModel.add(newReceiver);
        res.status(200).json({msg: "add receiver"});
    }
}