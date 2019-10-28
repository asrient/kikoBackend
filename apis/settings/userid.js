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
      if (req.body.userid != undefined || req.body.userid != null) {
        var newId = String(req.body.userid);
        newId = newId.trim();
        newId = newId.toLowerCase();
        if (newId.length > 2 && newId.length < 16) {
          var format = /[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/;

          if (format.test(newId)) {
            reply("FAILED", "UserID cannot have any special characters")
          } else {
            if (newId.indexOf(' ') >= 0) {
              reply("FAILED", "UserID cannot have spaces in between")
            }
            else {


              userkit.getUserCode(newId, (existing) => {
                if (existing != undefined) {
                  reply('FAILED', 'Sorry, ' + newId + ' is taken, try another')
                }
                else {
                  if (!checkOnly) {
                    //
                    common.users.findOne({ 'code': me.code }, (err, self) => {
                      if (self != null) {
                          self.userid=newId;
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
              })


            }
          }
        }
        else {
          reply('FAILED', 'userID too long or short')
        }
      }
      else {
        reply('FAILED', 'Please enter a new userID')
      }
    }
    else {
      reply('FAILED', 'You are not logged in.')
    }
  })
}

module.exports={call:call};