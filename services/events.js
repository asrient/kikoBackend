//Cant call update from here cuz, liveKit requires the file
var common = require('./common.js');
var userkit = require('./userKit.js');
var podkit = require('./podKit.js');

primaryEvents=(socket,me)=>{
    podkit.welcomeMe(me.code);
    socket.on('test', (data) => {
        console.log('////////////TEST event detected////////////');
        if (me != null) {
            console.log('Test event received from user ' + me.userid);
            console.log(data);
            var eId = common.code(2);
            update('/', [me.code, '5c1c4eb5720cd'], (user, done) => {
                setTimeout(() => {
                    done('hello', 'Hello ' + user + ', Welcome to Kiko Live Updates [' + eId + ']');
                }, 2000);

            })
        }
    })

    socket.on('join', (data) => {
        console.log('////////////JOIN event detected////////////');
        if (me != null) {
            console.log('Join event received from user ' + me.userid);
            console.log(data);

            if (data != undefined) {
             
               common.pods.findOne({code:data},(err,pod)=>{
                   if(pod!=null){
                podkit.joinPod(me.code, data, (r, err) => {
                    if (r == null) {
                        console.error(me.userid + ' cannot join pod [(on) Join - livekit]', err)
                    }
                    else {
                        console.log('user joined pod successfully!');
                    }
                })
                   }
                   else{
                       console.error('podCode sent with join event is invalid [join-events]',data,err)
                   }
               })
               
                
            }
            else {
                console.error('Join event detected without a pod code!');
            }

        }
    })

    socket.on('leave', () => {
        console.log('////////////LEAVE event detected////////////');
        if (me != null) {
            console.log('Leave event received from user ' + me.userid);

            podkit.leavePod(me.code, (r, err) => {
                if (r == null) {
                    console.error(me.userid + ' cannot leave pod [(on) Leave - livekit]', err)
                }
                else {
                    console.log('user left pod successfully!');
                }
            })


        }
    })

    socket.on('vote', (data) => {
        console.log('////////////Vote event detected////////////');
        if (me != null) {
            console.log('vote event received from user ' + me.userid);
            console.log('track: ', data);

            if (data != undefined) {
                userkit.hasUserVoted(me.code, (voted) => {
                    if (!voted) {
                        podkit.vote(data, me.code, (r, err) => {
                            if (r == null) {
                                console.error(me.userid + ' user could not vote [(on) vote - livekit]', err)
                            }
                            else {
                                console.log('user voted successfully!');
                            }
                        })
                    }
                    else {
                        console.error('Event VOTE detected from a user who already voted!')
                    }
                })

            }
            else {
                console.error('vote event detected without track!');
            }

        }
    })
}

matesEvents=(socket,me)=>{
    socket.emit('reply',' you can talk to you secret mate now! id: '+socket.id)
socket.on('msg',(text)=>{
    console.log('new text message received from ',me.userid)
podkit.yourSecretMate(me,text)
})
}

module.exports={primaryEvents,matesEvents}