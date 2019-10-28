/**
 * @ASRIENT
 * 15.6.19
 * handels the path /apis/user/songs 
 * Exposes the func 'call' to path/apis @pram 'req','reply(result,data)'
 *  Query: @lastkey 
 */
var common=require('../services/common.js');
var mk=require('../services/musicKit2.js');




call=(req,reply)=>{

 /** @sample  reply('SUCCESS',req.query.userid); */
var newkey=0;
var musickit=new mk();

common.reveal(req,(me)=>{
var lastkey=0;
if(req.query.lastkey!=undefined){
    lastkey=parseInt(req.query.lastkey) ;
      }

if(me!=null){
musickit.setUser(me.code,(acc,err)=>{
if(acc!=null){
musickit.getLovedTracks(lastkey,(codes,key)=>{
newkey=key;
var counter=0;
var rep=[];
console.log('loved tracks codes received!');
//console.log(codes);
codes.forEach(isrc => {
    musickit.getTrack({'isrc':isrc},(obj,err)=>{
        if(obj!=null){
          var repeat=[]
         repeat= rep.filter((prev)=>{ return prev.isrc==obj.isrc })
         if(repeat.length==0){
           var o=obj;
                o.is_loved=true;
            rep.push(o);
         }
            else{
              console.error('Repeted track found on user music lib');
            }  
           
        }
          
           counter++;
           // console.log('track obj added! current counter: '+counter);
            if(counter>=codes.length){
              //   console.log('reply',rep);
                reply('SUCCESS',{'paged':true,'items':rep,'lastkey':newkey});
            }
        
    })
});
})
}
else{
    reply('FAILED',err)
}
})
}
else{
  reply('FAILED','User not Logged In')
}


});

}



 module.exports={call:call};