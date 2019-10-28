/**
 * @ASRIENT 17th Sept 19
 * provides the pod mates list
 * `/apis/pod/songs?code=*podCode*`
 * *queries* @code 
 */

var common=require('../services/common.js');
var podkit=require('../services/podKit.js');
var userkit=require('../services/userKit.js');
var mk=require('../services/musicKit2.js');




call=(req,reply)=>{

    console.log("/apis/user/topsongs",req.query.userid)
/** @sample  reply('SUCCESS',req.query.userid); */
var musickit=new mk();

var songs=[];
var list=[];
getObj=(index)=>{
     next=index+1;
    if(songs[index]!=undefined){
          
    musickit.getTrackFromDB(songs[index],(obj)=>{
        if(obj!=null){
        list.push(obj);
        }
        console.log('song view obj',obj)
        counter(next)
            })   

    }
    else{
reply('FAILED','err songs arr undefined at '+index);
    }

}

counter=(next)=>{
    console.log('current count of tracks in [apis/user/topsongs] ',next,'/',songs.length);
if(next>=songs.length){
    reply('SUCCESS',{paged:false,items:list})
}
else{
    getObj(next)
}
}



if(req.query.userid!=undefined){
    userid=req.query.userid;
    var sel=[];
    common.users.findOne({userid:userid},(err,user)=>{
    if(user!=null){
        console.log("setting top tracks of:",user.code)
     user.top_songs.forEach((rec)=>{
      if(sel.length<11){
          sel.push(rec);
      }
      else{
          sel.find((l,index)=>{
             if(l.frequency<=rec.frequency){
                 sel[index]=rec;
                 return true;
             }
             else{
                 return false;
             }
          })
      }
     }
     );
     sel.sort((a,b)=>{
        return b.frequency-a.frequency;
     })
     songs=sel.map((elem)=>{
       return(elem.id)
     })
     console.log("top tracks are:",user.top_songs.length,sel,songs);
     if(songs.length){
         getObj(0);
     }
    else{
        reply("FAILED","No tracks here yet, check back later.")
    }
    }
    else{
        reply("FAILED","err: cannot get user from db")
    }
    })

}
else{
    reply('FAILED','code of pod not mentioned!');
}
}

module.exports={call:call};