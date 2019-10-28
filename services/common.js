/**
 * @ASRIENT
 */
const fs = require('fs');
//var mongo = require('mongodb').MongoClient;


const process = require('process');

  

 read=(file)=>{
  return   fs.readFileSync(file,'utf8', (err, data) => {
    if (err) throw err;
    return(data);
  });
 }


 //Init Vars for env vars

//

var Vars={};

if(process.env.vars==undefined){
Vars=JSON.parse(read('./vars.json')) ;
}
else{
  Vars=JSON.parse(process.env.vars);
}


const users=require('./models.js').users;
const pods=require('./models.js').pods;
const songs=require('./models.js').songs;
const visits=require('./models.js').visits;
/**
 * After u call reveal, u can use 'me' to get user instance of the curr user except following list
 * call reveal to init me with req of pipe.
 *  */


reveal=(req,callback)=>{
 if(req.cookies.ticket!=undefined)
{ users.find({'ticket':req.cookies.ticket},{'info':0,'following':0,'top_songs':0,'onpod':0},(err,data)=>{
    if(data[0]!=undefined){
      callback(data[0]);
    }
    else{
    callback(null);
    }
    
  })
}
 else{
  callback(null);
} 
}



time=()=>{
 return new Date().getTime();
}

var crypto=require('crypto');

code=(length=10)=>{
 return crypto.randomBytes(length).toString('hex');
}

const spotifyLib=require('spotify-web-api-node');

var credits={
  clientId: Vars.spotify.client_id,
  clientSecret: Vars.spotify.client_secret,
  redirectUri: Vars.permit_url
}
//console.log(credits);
var spotify = new spotifyLib(credits);

newSpotify=()=>{
return new spotifyLib(credits);
}





module.exports={
  read:read,
  vars:Vars,
  reveal:reveal,
  users:users,
  pods:pods,
  time:time,
  code:code,
  spotify:spotify,
songs:songs,
newSpotify,
visits
};