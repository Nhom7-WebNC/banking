module.exports  = {
    debtReminder: async function(req,res,next){
        setTimeout(function (){
            console.log('run !')
        }, 2000)
    }
}