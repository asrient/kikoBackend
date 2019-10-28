/**
 * @ASRIENT
 * 27.5.19
 * handels the path /apis/keys
 * Exposes the func 'call' to path/apis @pram 'req','reply(result,data)'
 */
var common=require('../services/common.js');
var mk=require('../services/musicKit2.js');



call=(req,reply)=>{

 /** @sample  reply('SUCCESS',req.query.userid); */
 var musicKit=new mk();
common.reveal(req,(me)=>{
if(me==null){
    reply('FAILED','User not logged In.')
}
else{

 musicKit.setUser(me.code,(access_token,err)=>{
  if(access_token!=null){
     reply('SUCCESS',access_token);
  }
 else{
   reply('FAILED',err);
 }
})

}




});

}



 module.exports={call:call};

/*
common.users.find({'code':me.code},{'source':1},(err,data)=>{
    if(data[0]==undefined){
        reply('FAILED','User not valid');
    }
    else{
      var source=  data[0].source;
      
      console.log('Keys refreshing...');
      common.spotify.setRefreshToken(source.refresh_token);

      common.spotify.refreshAccessToken().then(
        function(data) {
          console.log('The access token has been refreshed!');
      
          // Save the access token so that it's used in future calls
         // common.spotify.setAccessToken(data.body['access_token']);

          common.users.update({'code':me.code},{
              'source.access_token':data.body['access_token'],
              'source.next_refresh':(data.body['expires_in']+common.time())
            },(err,r)=>{
                 reply('SUCCESS',data.body['access_token']);
            })


         
        },
        function(err) {
          console.log('Could not refresh access token: '+err);
          reply('FAILED',err);
        }
      );
     
    }
})*/


