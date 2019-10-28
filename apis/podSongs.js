/**
 * @ASRIENT 27th June 19
 * provides the pod mates list
 * `/apis/pod/songs?code=*podCode*`
 * *queries* @code 
 */

var common=require('../services/common.js');
var podkit=require('../services/podKit.js');
var userkit=require('../services/userKit.js');
var mk=require('../services/musicKit2.js');




call=(req,reply)=>{
/** @sample  reply('SUCCESS',req.query.userid); */
var musickit=new mk();

var isVoted=false;
var podCode=null;
var songs=[];
var list=[];
var self=null;
getObj=(index)=>{
     next=index+1;
    if(songs[index]!=undefined){
          
if(self!=null){
     musickit.getTrackObj({isrc:songs[index].isrc},(obj)=>{
if(obj!=null){
    if(isVoted){
        obj.votes=songs[index].votes;
    }
list.push(obj)
}
counter(next)
    })

   
}
else{
    musickit.getTrackFromDB(songs[index].isrc,(obj)=>{
        if(obj!=null){
        list.push(obj)
        }
        counter(next)
            })   
} 
    }
    else{
reply('FAILED','err songs arr undefined at '+index);
    }

}

counter=(next)=>{
    console.log('current count of tracks in [apis/pod/songs] ',next,'/',songs.length);
if(next>=songs.length){
    reply('SUCCESS',{paged:false,items:list})
}
else{
    getObj(next)
}
}



if(req.query.code!=undefined){
    podCode=req.query.code;
    common.reveal(req,(me)=>{
self=me;
 list=[];
     var i=null;
if(me!=null){
    i=me.code;
}
 userkit.getCurrentPod(i,(onpod)=>{
if(onpod!=undefined&&onpod.code==podCode&&onpod.voted_for!=undefined){
    isVoted=true;
}

 podkit.getPodTracksObjs(podCode,(tracks,err)=>{
  if(tracks!=null){
        songs=tracks;
       if(me!=null){
    musickit.setUser(self.code,(acc,err)=>{
      if(acc!=null){
      
            getObj(0)
           
      }
      else{
          console.error('cannot set user for getting pod songs',err)
          reply('FAILED','cannot set user for getting pod songs [apis/pod/songs]')
      }
          })

  }
  else{
  getObj(0)
  } 
  }
  else{
      console.error('could not get pod tracks ',err)
      reply('FAILED','cannot get pod tracks [apis/pod/songs]'+err)
  }
   


    },true)

 })



    })

}
else{
    reply('FAILED','code of pod not mentioned!');
}
}

module.exports={call:call};