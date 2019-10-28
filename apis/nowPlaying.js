/**
 * @ASRIENT
 * 4.8.19
 * handels the path /apis/pod/now-playing
 * Exposes the func 'call' to path/apis @pram 'req','reply(result,data)'
 *  Query: none
 */
var common=require('../services/common.js');
var mk=require('../services/musicKit2.js');
var userkit=require('../services/userKit.js');


call=(req,reply)=>{

 /** @sample  reply('SUCCESS',req.query.userid); */

common.reveal(req,(me)=>{
  var musickit=new mk();

  if(me!=null){
    userkit.getCurrentPod(me.code,(onpod)=>{
if(onpod==undefined){
  reply("FAILED",'You are not on any pod rn.')
}
else{
 var podCode=onpod.code;
common.pods.findOne({code:podCode},(err,pod)=>{
if(err!=null||pod==null){
reply("FAILED","ERR: Could not find pod obj.")
}
else{
musickit.setUser(me.code,()=>{
    musickit.getTrackObj({'isrc':pod.now_playing},(obj,err)=>{
        if(obj!=null){
      reply('SUCCESS',obj);
        }
      else{
        reply('FAILED',err);
      }
    })
    })
}
})
  
}
    })

  }
else{
  reply('FAILED','Pls logIn first.')
}


});

}



 module.exports={call:call};