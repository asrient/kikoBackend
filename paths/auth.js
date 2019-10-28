const express = require('express');
const Router = express.Router;
const common=require('../services/common.js');
/** 
 * @ASRIENT
 * Exposes the function that handels @permit & @keys of the site.
 */

let pipe=Router();



  pipe.get('/permit',(req,res)=>{

common.reveal(req,(me)=>{
if(me==null){
  if(req.query.code!=undefined){


//console.log(req.query);
common.spotify.authorizationCodeGrant(req.query.code).then(
  function(data) {
    console.log('The token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    console.log('The refresh token is ' + data.body['refresh_token']);

    // Set the access token on the API object to use it in later calls
   common.spotify.setAccessToken(data.body['access_token']);
   common.spotify.setRefreshToken(data.body['refresh_token']);

common.spotify.getMe().then(
  (ME)=>{
 

ME=ME.body;
if(ME.id!=undefined){
//res.send(ME);

common.users.find({'source.id':ME.id},{'userid':1,'code':1,'info.name':1,'info.dp':1},(err,dat)=>{
  if(dat[0]!=undefined){
    var ticket=common.code();

common.users.updateOne({'code':dat[0].code},{$set:{
  'ticket':ticket,
  'source.refresh_token':data.body['refresh_token'],
  'source.access_token':data.body['access_token'],
  'source.next_refresh':((data.body['expires_in']*1000)+common.time())
}},{},
(err,r)=>{
   res.cookie('ticket',ticket,{domain:common.vars.domain,maxAge:432000000});  //5 days
   res.redirect('/pods');
  // res.render('welcome',{'is_new':false,'userid':dat[0].userid,'name':dat[0].info.name,'dp':dat[0].info.dp});
}
)

  }

  else{
    var ticket=common.code();
user={
  'code':common.code(),
'userid':'user'+common.code(5),
'created_on':common.time(),
'info':{
 'name':'Music Lover',
 'dp':'/icon/dp.png',
 'is_custom_dp':false
 },
 'source':{
   'app':'spotify',
   'id':ME.id,
  'refresh_token':data.body['refresh_token'],
  'access_token':data.body['access_token'],
  'next_refresh':(data.body['expires_in']+common.time())
 },
'ticket':ticket,
'last_seen':common.time(),
'following':[],
'followers_count':0,
'top_songs':[]
}

var sel = 1;
                do { sel = Math.floor(Math.random() * 10) }
                while (sel>5 && sel<1)
                user.dp = '/icon/dp'+sel+'.jpg';

if(ME.display_name!=null&&ME.display_name!=undefined){
  user.info.name=ME.display_name;
}
if(ME.email!=null&&ME.email!=undefined){
  user.info.email=ME.email;
}
if(ME.birthdate!=null&&ME.birthdate!=undefined){
  user.info.birthdate=ME.birthdate;
}
if(ME.country!=null&&ME.country!=undefined){
  user.info.country=ME.country;
}
if(ME.external_urls.spotify!=undefined){
  user.info.links={'spotify':ME.external_urls.spotify};
}
var entry= new common.users(user);

entry.save((err,r)=>{
  res.cookie('ticket',ticket,{maxAge:432000000});  //5 days
  //res.render('welcome',{'is_new':true,'name':user.info.name});
  res.redirect('/settings');
})
  }
})

}
else{
  res.render('error',{err:'Spotify userID not found.'})
}

  },
(err)=>{ res.render('error',{err:err})}
)


  },
  function(err) {
    res.render('error',{err:err});
  }
);
    }
    else{
      res.render('error',{err:'Code not provided.'});
    }

}
else{
  res.render('error',{err:'You are already Logged In.'});
}




})

  


  });



  
 

module.exports=pipe;