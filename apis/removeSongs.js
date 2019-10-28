/**
 * @ASRIENT
 * 22 July 19
 * handels the path `/apis/pod/songs/remove`
 * Exposes the func `call` to path/apis @pram `req`,`reply(result,data)`
 *  Query: @songs 
 */
var common=require('../services/common.js');
var podkit=require('../services/podKit.js');
var userkit=require('../services/userKit.js');


call=(req,reply)=>{

 /** @sample  reply('SUCCESS',req.query.userid); */

var tracks=[];

if(req.query.tracks!=undefined&&req.query.tracks!=null&&req.query.tracks.length!=undefined){
  tracks=JSON.parse(req.query.tracks);
if(tracks.length){
  common.reveal(req,(me)=>{

    userkit.getCurrentPod(me.code,(onpod)=>{
    if(onpod!=undefined){
    if(onpod.role=='host'){
    podkit.removeSongsFromPod(tracks,onpod.code,(r,err)=>{
    if(r!=null){
      reply('SUCCESS');
    }
    else{
      reply('FAILED',err);
    }
    })
    }
    else{
      reply('FAILED','You cannot remove songs from this pod.')
    }
    }
    else{
      reply('FAILED','You are not on any pod currently.')
    }
    })
    
    });
}
else{
  reply('FAILED','no tracks selected')
}
}
else{
  reply('FAILED','invalid request');
}


}



 module.exports={call:call};