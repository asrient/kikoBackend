/*
 * @ASRIENT 
 * created on 12 March 2019.
 * The Entry point for kiko webStation
 */

const common=require('./services/common.js');
const fs = require('fs');
const express = require('express');

const cookieParser = require('cookie-parser')();
var useragent = require('useragent');

const houseKeeping = require('./services/houseKeeping.js');

const mainPage =require('./paths/mainpage.js');
const apis =require('./paths/apis.js');
const auth =require('./paths/auth.js');
const root =require('./paths/root.js');
const settings =require('./paths/settings.js');

var mongoose = require('mongoose');

var opts = {
    useNewUrlParser: true,
  server: {
  socketOptions: { keepAlive: 1 }
  }
  };

mongoose.connect(common.vars.db.url, opts);


const pipe=express();

var http = require('http').Server(pipe);
var io = require('socket.io')(http);

pipe.set('port', process.env.PORT || 3000);
pipe.disable('x-powered-by');
pipe.set('view engine', 'ejs');

pipe.use(cookieParser);

pipe.use((req,res,next)=>{

getSource=()=>{
  var agent=useragent.parse(req.headers['user-agent']);
  var s={
    os:agent.os.toString(),
    app:agent.toAgent()
  }
  if(req.query.ref!=undefined){
    if(req.query.ref=='pwa'){
    s.reference='pwa'
  }
  else if(req.query.ref=='ig'){
    s.reference='instagram'
  }
  else if(req.query.ref=='tw'){
    s.reference='twitter'
  }
  else{
    s.reference=req.query.ref;
  }
  }
if(req.headers["HTTP_CF_IPCOUNTRY"]!=undefined){
  s.country=req.headers["HTTP_CF_IPCOUNTRY"];
}
  return(s)
}

getIp=()=>{
  var ip=req.headers['x-forwarded-for'];
  if(ip){
    var list=ip.split(',');
    ip=list[list.length-1]
  }
  else{
    ip=req.connection.remoteAddress;
  }
  return ip;
}

userField=(v,cb)=>{
common.reveal(req,(me)=>{
if(me!=null){
  v.user=me.code;
}
cb(v);
})
}

if(req.path=='/'){
var view = new common.visits({
  page:"root",
source:getSource(),
time:common.time(),
ip:getIp()
})

userField(view,(v)=>{
  v.save()
})

}
else if(req.path=='/info'){
  var view = new common.visits({
    page:"info",
  source:getSource(),
  time:common.time(),
  ip:getIp()
  })
    view.save()
  }
 
  else if(req.path.slice(0,2)=='/@'){
    var view = new common.visits({
      page:"idcard",
    source:getSource(),
    time:common.time(),
    ip:getIp()
    })

if(req.query.userid!=undefined){
  view.target=req.query.userid;
}
      view.save()
    }

    

  next();


})



pipe.set('views','./pages');
// Directly exposed files of the webstation
pipe.use(express.static(__dirname + '/exposed'));

pipe.get('/info',(req,res)=>{
res.render('info');
});

pipe.use(root);
pipe.use(apis);
pipe.use(mainPage);
pipe.use(auth);
pipe.use(settings);





//  404 page
pipe.use(function(req, res){
    res.type('text/html');
    res.status(404);
    res.send(common.read('./pages/sorry.html'));
    });
    //  500 page
    pipe.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('text/html');
    res.status(500);
    res.send('<h1>500 - Server Error</h1><br>'+err.stack);
    });




    const live = require('./services/liveKit.js');
   
    live.goLive(io);

    houseKeeping.initResets();

    http.listen(pipe.get('port'), function(){
       
        console.log( `
        //   //   //  //   //   ////////
        //  //    //  //  //    //    //
        ////      //  ////      //    //
        //  //    //  //  //    //    //
        //   //   //  //   //   //    //
        //    //  //  //    //  ////////
         ` );
        })