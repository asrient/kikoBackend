/**
 * @ASRIENT
 * 27.5.19
 * handels the path /apis/pod/new
 * Exposes the func 'call' to path/apis @pram 'req','reply(result,data)'
 *  Query: @name @about @songs 
 * @data `pod code`
 */
var common=require('../services/common.js');
var mk=require('../services/musicKit2.js');

var userKit=require('../services/userKit.js');
var podKit=require('../services/podKit.js');


createPod=(q,me,reply)=>{
var musickit=new mk();
   if(q.name!=undefined&&q.songs!=undefined&&q.songs.length!=0){
     
console.log('query valid',q);
var pod= {
   code:common.code(),
name:q.name,
host:me,
art:'/icon/art.png',
started_on:common.time()

  }

pod.songs=q.songs.map((song)=>{

//Call new Music(me).getTrackIsrc(song,(isrc)=>{})
   return {
      isrc:song,
      added_on:common.time(),
      votes:0
   }
})

pod.now_playing=q.songs[0];
musickit.setUser(me,(acc,err)=>{
if(acc==null){
   reply('FAILED',err);
}
else{
 musickit.getTrackLength({isrc:pod.now_playing},(length)=>{
if(length!=null){
    pod.next_refresh=common.time()+length;
    pod.track_length=length;
console.log(pod);
var entry= new common.pods(pod);
entry.save((err,r)=>{
   //Pod created, now make the host join it. userkit.joinPod
   //set timeout for podkit.reset
   setTimeout(() => {
      podKit.reset(pod.code);
   }, length);
   podKit.joinPod(me,pod.code,(r,err)=>{
      if(r!=undefined){
         reply('SUCCESS',pod.code)
      }
      else{
         reply('FAILED',err);
      }
   },'host');
   
})
}
  else{
     reply('FAILED','cannot get song length');
  }


})  
}
})



  
   }
   else{
      reply('FAILED','Invalid input');
   }
}



call=(req,reply)=>{

 /** @sample  reply('SUCCESS',req.query.userid); */

common.reveal(req,(me)=>{


if(me!=null){
userKit.getCurrentPod(me.code,(pod)=>{
   if(pod==undefined){
      var q=req.query;
      console.log('user not on any pod, creating pod...');
      if(q.name!=undefined&&q.songs!=undefined){
      //   q.name=JSON.parse(q.name);
         q.songs=JSON.parse(q.songs);
         console.log('req prams',q);
      if(q.songs.length){
         if(q.name.length>3){
         createPod(q,me.code,reply);   
         }
else{
   reply('FAILED','name too small');
}
      }
      else{
         reply('FAILED','please select some songs');
      }
      }
      else{
         reply('FAILED','all prams not provided');
         console.error('req received',q);
      }
    
   }
   else{
      reply('FAILED','Pls leave the current pod first.');// call leavePod func then call createPod()
   }
})
}
else{
   reply('FAILED','Pls Log in First');
}





});

}



 module.exports={call:call};