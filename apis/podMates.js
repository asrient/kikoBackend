/**
 * @ASRIENT 27th June 19
 * provides the pod mates list
 * `/apis/pod/mates?code=*podCode*`
 * *queries* @code 
 */

var common=require('../services/common.js');
var podkit=require('../services/podKit.js');
var userkit=require('../services/userKit.js');

call=(req,reply)=>{
/** @sample  reply('SUCCESS',req.query.userid); */
if(req.query.code!=undefined){
    common.reveal(req,(me)=>{
        if(me!=null){
var podCode=req.query.code;
podkit.getMyPodFollowing(me.code,(mates,err)=>{
if(mates!=null){
var counter=0;
var objs=[]
if(mates.length){
mates.forEach(mate => {
    userkit.getUserObj(mate,'mates',me.code,(obj)=>{
if(obj!=undefined){
objs.push(obj)
}
counter++;
if(counter>=mates.length){
    reply('SUCCESS',{paged:false,items:objs})
}
    })
});
}
else{
    reply('SUCCESS',{paged:false,items:[]})
}

}
else{
    reply('FAILED','Error while getting pod mates codes,'+err)
}
},podCode)
        }
        else{
            reply('FAILED','Log In to view')
        }
    })

}
else{
    reply('FAILED','code of pod not mentioned!');
}
}

module.exports={call:call};