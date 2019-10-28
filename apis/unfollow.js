/**
 * @ASRIENT
 * 16 June 19
 * handels the path /apis/user/unfollow
 * Exposes the func 'call' to path/apis @pram 'req','reply(result,data)'
 *  Query: @user
 */
var common=require('../services/common.js');
var userkit=require('../services/userKit.js');



call=(req,reply)=>{

 /** @sample  reply('SUCCESS',req.query.userid); */

common.reveal(req,(me)=>{

if(me!=null){
if(req.query.user!=undefined){

  userkit.getUserCode(req.query.user,(user,err)=>{
if(user!=undefined){
userkit.unfollow(user,me.code,(r,err)=>{
if(r==0){
  reply('FAILED',err)
}
else{
  reply('SUCCESS');
}
});
}
else{
  reply('FAILED','user not found!');
}
  })

}
else{
  reply('FAILED','user not mentioned!');
}
}
else{
  reply('FAILED','pls Log In first!');
}




});

}



 module.exports={call:call};