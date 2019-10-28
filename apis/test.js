/**
 * @ASRIENT
 * 27.5.19
 * handels the path /apis/new-pod
 * Exposes the func 'call' to path/apis @pram 'req','reply(result,data)'
 *  Query: @name @about @songs 
 */
var common=require('../services/common.js');
var musickit=require('../services/musicKit.js');



call=(req,reply)=>{

 /** @sample  reply('SUCCESS',req.query.userid); */

reply('SUCCESS','Kiko WebStation [DEV]')

}



 module.exports={call:call};