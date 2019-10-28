/**
 * @ASRIENT
 * 22.4.19
 * handels the path /apis/user/idcard
 * Exposes the func 'call' to path/apis @pram 'req','reply(result,data)'
 */
var common=require('../services/common.js');
var userKit=require('../services/userKit.js');

IDcardObj=(code,me,reply)=>{


userKit.getUserObj(code,'IDcard',me,(data)=>{
   if(data==undefined){
      reply('FAILED','no user found');
   }
   else{
      reply('SUCCESS',data);
   }
})
}

call=(req,reply)=>{

 /** @sample  reply('SUCCESS',req.query.userid); */

common.reveal(req,(me)=>{


if(req.query.userid==undefined&&me==null){
   reply("FAILED",'Invalid request');
}
else if(req.query.userid!=undefined){
 
 
   userKit.getUserCode(req.query.userid,(code)=>{
      var m=me;
 if(me!=null){
    m=m.code;
 }
      IDcardObj(code,m,reply);
      });
}
else if(me!=null){
   IDcardObj(me.code,me.code,reply);
}





  /* 
common.users.find({'userid':user},{'code':0,'source':0,'following':0,'ticket':0,'info.birthdate':0,'_id':0,'info.country':0,'info.email':0},
(err,data)=>{
if(data[0]!=undefined){

   var self=false;
if(user==me.userid){
self=true;
}

var dat={userid:data[0].userid,
   followers_count:data[0].followers_count,
   top_songs:data[0].top_songs,
   trophies:data[0].trophies,
   isSelf:self};
   
Object.assign(dat,data[0].info);

    reply('SUCCESS',dat);
    
}
else{reply('FAILED','no such user exists.')}
})*/




});

}



 module.exports={call:call};