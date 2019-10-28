/**
 * @ASRIENT
 * 15.6.19
 * handels the path /apis/following
 * Exposes the func 'call' to path/apis @pram 'req','reply(result,data)'
 *  Query: @lastkey 
 */
var common=require('../services/common.js');
var userkit=require('../services/userKit.js');



call=(req,reply)=>{

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
  if(req.query.lastkey!=undefined){
lastkey=parseInt(req.query.lastkey);
  }
userkit.getUserFollowing(me.code,(ppl,key)=>{
usrs=ppl;
newkey=key;
if(usrs.length){
  getObj(usrs[0]);
}
else{
  reply('FAILED','no users found!');
}

},true,lastkey)
}
else{
  reply('FAILED','User not Logged In')
}


});

}



 module.exports={call:call};