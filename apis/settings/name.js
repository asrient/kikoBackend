/**
 * @ASRIENT
 * 3rd Sept 19
 */

var common = require('../../services/common.js');
var userkit = require('../../services/userKit.js');


call = (req, reply) => {

  /** @sample  reply('SUCCESS',req.query.userid); */

  common.reveal(req, (me) => {
    var checkOnly = true;
    if (req.query.action != undefined) {
      if (req.query.action == 'set') {
        checkOnly = false;
      }
    }
    if (me != null) {
      if (req.body.name != undefined || req.body.name != null) {
        var newId = String(req.body.name);
        newId = newId.trim();
        if (newId.length > 2 && newId.length < 20) {
       
                  if (!checkOnly) {
                    //
                    common.users.findOne({ 'code': me.code }, (err, self) => {
                      if (self != null) {
                          self.info.name=newId;
                          self.save(()=>{
                            reply('SUCCESS');
                          })
                      }
                      else {
                          reply('FAILED','ERR: could not find user instance in db')
                      }
                  });
              
                  }
                  else {
                    reply('SUCCESS', 'nice one!')
                  }
                
              


            
          
        }
        else {
          reply('FAILED', 'Name too long or short')
        }
      }
      else {
        reply('FAILED', 'Please enter a name')
      }
    }
    else {
      reply('FAILED', 'You are not logged in.')
    }
  })
}

module.exports={call:call};