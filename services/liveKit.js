/**
 * @ASRIENT 7th June 19
 * manages all the live tasks
 */
const cookie = require('cookie');
var store = [];
var mStore = [];
var sStore = [];
var common = require('./common.js');




var io;

init = (channel, bucket, cb) => {
    io.of(channel).on('connection', function (socket) {

        socket.on('disconnect', function () {
            console.log('/////////socket disconnected/////////')
         /*   var recs = bucket.filter((elem) => {
                return elem.socketId == socket.id
            })
            var indexes = recs.map((val, index) => {
                return index;
            })
*/
       
           bucket.forEach((elem,index)=>{
               if(elem.socketId == socket.id){
                 
                   bucket.splice(index, 1);
                  console.log('removing user from bucket index: '+index);
               }
           })


              console.log('bucket after removal',bucket);
            console.log('socket ' + socket.id + ' disconnected. channel:',channel);
        });



        //Authorising
        console.log('a user connected as: ', socket.id,' channel:',channel);

        var cookies = {};

        if (socket.handshake.headers.cookie != undefined) {
            cookies = cookie.parse(socket.handshake.headers.cookie);
        }

        // console.log('ticket of the user is: '+cookies.ticket);
        //var ME=null;
        common.reveal({ 'cookies': cookies }, (me) => {
            if (me != null) {
                //adding it to our bucket of sockets
                bucket.push({
                    'code': me.code,
                    'socketId': socket.id,
                    'added_on': common.time()
                })
                console.log('bucket after addition',bucket);
                console.log('user ' + me.userid + ' authorised.')
                // ME=me;
                cb(socket, me);
            }
            else {
                //disconnecting as its unauthorised!
                console.warn('[UNAUTHORISED] socket ' + socket.id + ' will be disconnected!')
                socket.emit('disconnect');
            }
        })





    });
}




function goLive(i) {
    io = i;

    var events=require('./events.js');

    init('/', store, (socket, me) => {
        //Initialise the event listeners

events.primaryEvents(socket,me)

     

    });

    init('/mates', mStore, (socket,me) => {
       
        events.matesEvents(socket,me)
    });

    init('/songs', sStore, (socket) => {

   socket.emit('msg','connected to server at /songs as: '+socket.id)

    });

}

//returns an array of sockets
getSocketIds = (code, bucket) => {
    var rec = []
    rec = bucket.filter((r) => {
        return r.code == code
    })
    var ids = []
    ids = rec.map((r) => {
        r.socketId
    })

    return ids;

}

getRecsbyCode = (code, bucket) => {
    var rec = []
    rec = bucket.filter((r) => {
        return r.code == code
    })
    return rec;
}



getUserCode = (id, bucket) => {
    var rec = {}
    var rec = bucket.find((r) => {
        return r.socketId == id
    })
    if (rec.code != undefined) {
        return rec.code;
    }
    else {
        return null
    }

}


update = (channel, users, cb) => {
    console.log('/////update-livekit//////');
    var bucket = store;
    if (channel == '/mates') {
        bucket = mStore
    }
    else if (channel == '/songs') {
        bucket = sStore;
    }
    var activeRecs = [];
    if(users!=null){
         users.forEach((user) => {
             console.log('rec for user ',user,getRecsbyCode(user, bucket));
        activeRecs = activeRecs.concat(getRecsbyCode(user, bucket));
    })
    }
   if(!activeRecs.length){
       console.warn('to valid sockets found for the update',channel,users);
   }
    activeRecs.forEach((rec) => {
        //code, done(event,msg)
        cb(rec.code, (event, msg) => {
            //sending event
            if (event != undefined) {
                console.warn('emiting event to ', rec.code, event,rec.socketId);
                io.of(channel).to(rec.socketId).emit(event, msg);
            }
        })
    })
}



module.exports = {
    goLive: goLive,
    update: update
}