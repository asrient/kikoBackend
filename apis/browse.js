/**
 * @ASRIENT
 * 6th July 19
 * handels the path /apis/new-pod
 * Exposes the func 'call' to path/apis @pram 'req','reply(result,data)'
 */
var common=require('../services/common.js');
var podkit=require('../services/podKit.js');



call=(req,reply)=>{
  var objs=[];
  var newkey=0;
 
 /** @sample  reply('SUCCESS',req.query.userid); */
 lastkey=0;
if(req.query.lastkey!=undefined){
lastkey=parseInt(req.query.lastkey);
}
common.pods.find({},{code:1},(err,pods)=>{
if(pods!=undefined){
if(pods.length){
var counter=0;
pods.forEach((pod)=>{
podkit.getPodObjMin(pod.code,(obj)=>{
  counter++;
if(obj!=null){
  objs.push(obj)
}
if(counter>=pods.length){
  reply('SUCCESS',{paged:true,items:objs,lastkey:lastkey+pods.length})
}
})
})
}
else{
  reply('FAILED','no pods here yet')
}
}
else{
  reply('FAILED','err while getting pods'+err)
}
}).sort({started_on:-1}).skip(lastkey).limit(20);

}



 module.exports={call:call};