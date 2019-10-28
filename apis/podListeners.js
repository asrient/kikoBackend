/**
 * @ASRIENT
 * 5 July 19
 * handels the path /apis/followers
 * Exposes the func 'call' to path/apis @pram 'req','reply(result,data)'
 *  Query: @lastkey 
 */
var common=require('../services/common.js');
var userkit=require('../services/userKit.js');




call=(req,reply)=>{

  //not using podkit ver cause this one sorts query
getPodListeners = (pod,skip=0, cb) => {
  common.users.find({ 'onpod.code': pod }, { code: 1 }, (err, listeners) => {
      if (listeners != undefined) {
          var res = listeners.map((listener) => {
              return listener.code
          })
         if(cb!=undefined){
            cb(res,skip+20)
         }
         else{
           console.error("cb was undefined [getPodListeners - apis/podListeners]"," original result was",res);
         }
      }
      else {
        if(cb!=undefined){
          cb(null, '[getPodListeners-podkit] ' + err)
       }
       else{
         console.error("cb was undefined [getPodListeners - apis/podListeners]"," original result was an err",err);
       }
      }
  }).sort({'onpod.joined_on':-1}).skip(skip).limit(20);
}

 /** @sample  reply('SUCCESS',req.query.userid); */

var usrs=[];
var objs=[];
var newkey=0;
var myCode=null;

getObj=(code)=>{
  userkit.getUserObj(code,'people',myCode,(obj)=>{
  counter(obj);
      })
}

counter=(obj)=>{
objs.push(obj);
if(objs.length>=usrs.length){
  reply('SUCCESS',{'paged':true,'items':objs,'lastkey':newkey})
}
else{
  getObj(usrs[objs.length])
}
}

common.reveal(req,(me)=>{
  var lastkey=0;

if(me!=null){
myCode=me.code;
userkit.getCurrentPod(myCode,(pod)=>{
if(pod!=undefined){
  if(req.query.lastkey!=undefined){
lastkey=parseInt(req.query.lastkey);
  }
  getPodListeners(pod.code,lastkey,(ppl,key)=>{
    if(ppl!=null){
      usrs=ppl;
newkey=key;
if(usrs.length){
  getObj(usrs[0]);
}
else{
  reply('FAILED','no users on this pod!');
}
    }
else{
  reply('FAILED','error while getting pod listeners'+key)
}


})
}
else{
  reply('FAILED','You are not on any pod!')
}
})

}
else{
  reply('FAILED','User not Logged In')
}


});

}



 module.exports={call:call};