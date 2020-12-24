const {clearHache, clearHash} = require('../services/cache');

module.exports =async (req,res,next)=>{
    // this will let route handle do everything it needs to do
    await next()

    // we will do our work after route handler finishes all of its work

    clearHash(req.user.id);
}