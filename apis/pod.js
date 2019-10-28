/**
 * @ASRIENT 27th June 19
 * provides the pod page data
 * `/apis/pod?code=*podCode*`
 * *queries* @code 
 */

//var common=require('../services/common.js');
var podkit=require('../services/podKit.js');

call=(req,reply)=>{
/** @sample  reply('SUCCESS',req.query.userid); */
if(req.query!=undefined){
  //  console.log(req.query);
if(req.query.code!=undefined){
    podkit.getPodObj(req.query.code,(obj,err)=>{
if(obj!=null){
reply('SUCCESS',obj)
}
else{
    reply('FAILED',err)
}
    })
}
else{
    reply('FAILED','code of pod not mentioned!');
}
}
else{
    reply('FAILED','Queries are required.')
}

}

module.exports={call:call};