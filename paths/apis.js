const express = require('express');
const Router = express.Router;
const common=require('../services/common.js');
/** 
 * @ASRIENT
 * Exposes the function that handels apis of the site.
 */

let pipe=Router();

var bodyParser = require('body-parser')
pipe.use( bodyParser.json() );       // to support JSON-encoded bodies
pipe.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

response=(req,res,file)=>{
  var isSent=false;
  var api=require('../apis/'+file);
    api.call(req,(result,data)=>{
      if(!isSent){
        res.type('text/json');
     res.status(200);
     isSent=true;
      res.send({"result":result,"data":data});
      }
      else{
        console.error('//////////api.call called after res sent///////',result,data);
      }
    })
}

  pipe.get('/apis/user/idcard',(req,res)=>{response(req,res,'idcard.js')});
  pipe.get('/apis/pod/new',(req,res)=>{response(req,res,'newPod.js')});
  pipe.get('/apis/test',(req,res)=>{response(req,res,'test.js')});
  pipe.get('/apis/keys',(req,res)=>{response(req,res,'keys.js')});
  pipe.get('/apis/user/following',(req,res)=>{response(req,res,'following.js')});
  pipe.get('/apis/user/followers',(req,res)=>{response(req,res,'followers.js')});
  pipe.get('/apis/user/songs',(req,res)=>{response(req,res,'myTunes.js')});
  pipe.get('/apis/user/topsongs',(req,res)=>{response(req,res,'topSongs.js')});
  pipe.get('/apis/user/follow',(req,res)=>{response(req,res,'follow.js')});
  pipe.get('/apis/user/unfollow',(req,res)=>{response(req,res,'unfollow.js')});
  pipe.get('/apis/pod',(req,res)=>{response(req,res,'pod.js')});
  pipe.get('/apis/pod/mates',(req,res)=>{response(req,res,'podMates.js')});
  pipe.get('/apis/pod/songs',(req,res)=>{response(req,res,'podSongs.js')});
  pipe.get('/apis/pod/listeners',(req,res)=>{response(req,res,'podListeners.js')});
  pipe.get('/apis/browse',(req,res)=>{response(req,res,'browse.js')});
  pipe.get('/apis/pod/songs/add',(req,res)=>{response(req,res,'addSongs.js')});
  pipe.get('/apis/pod/songs/remove',(req,res)=>{response(req,res,'removeSongs.js')});
  pipe.get('/apis/pod/now-playing',(req,res)=>{response(req,res,'nowPlaying.js')});
  pipe.post('/apis/settings/userid',(req,res)=>{response(req,res,'settings/userid.js')});
  pipe.post('/apis/settings/name',(req,res)=>{response(req,res,'settings/name.js')});
  pipe.post('/apis/settings/dp',(req,res)=>{response(req,res,'settings/dp.js')});

module.exports=pipe;