/**
 * @ASRIENT 10th July 19
 * some house keeping stuffs like init resets after restart of server bla bla bla
 * `initResets` 
 * */
var common = require('./common.js');
var podkit = require('./podKit.js');

initResets=()=>{
common.pods.find((err,pods)=>{
    if(err!=null){
        console.error('err while getting pods for init reset [initialize]',err);
    }
pods.forEach(pod => {
   if(pod.next_refresh<=common.time()) {
       //pod should have already been reset! nm, lets do it now :P
       console.log('pod',pod.code,'will be reset [initialize]');
podkit.reset(pod.code);
   }
   else{
       console.log('pod',pod.code,'set to reset [initialize]');
       setTimeout(()=>{
        podkit.reset(pod.code);      
       },pod.next_refresh-common.time())
}
})
})
}
module.exports={initResets}