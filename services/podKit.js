/**
 * @ASRIENT 24th June 19
 * manages all the live tasks
 */

var common = require('./common.js');
var mk = require('./musicKit2.js');
var userkit = require('./userKit.js');
var livekit = require('./liveKit.js');



stop = (pod, cb) => {
    console.log('-----------stop-podkit-----------');
    next=()=>{
        console.log('attempting to remove the pod from db..');
        common.pods.remove({code:pod},()=>{
            console.log('attempted to remove the pod from db');
            cb(1)
        })
    }
    common.users.find({ 'onpod.code': pod }, { code: 1 }, (err, usrs) => {
        if(err!=null){
            console.log('[podkit-stop]',err);
        }
        if (usrs == undefined||usrs.length==0) {
            console.log('no one was listining to this pod anyways :/')
            next(1)
        }
        else {
            var counter = 0;
            usrs.forEach((usr) => {
                leavePod(usr.code, (r) => {
                    counter++;
                    console.log('a user kicked out of the pod [pod stopping]',counter);
                    if (counter >= usrs.length) {
                        console.log(counter,' users forced out of the dead pod!');
                        next(1)
                    }
                })
            })
        }
    })
}

getPodObj = (pod, cb) => {
    common.pods.find({ code: pod }, { code: 1, name: 1, art: 1, about: 1, host: 1 }, (err, data) => {
        if (data[0] != undefined) {
            data = data[0];
            var pod = {
                name: data.name,
                code: data.code,
                art: data.art,
                about: data.about
            }
            userkit.getUserObjMin(data.host, (r, err) => {
                if (r == undefined) {
                    console.error('error while finding host [getPodObj-podkit]' , err);
                    cb(null, 'error while finding host [getPodObj-podkit]')
                }
                else {
                    pod.host = r;
                    getListenersCount(pod.code, (len,err) => {
                       if(len==null){
                           console.error('err while finding followers count [getPodObj]')
                       }
                    
                            pod.listeners = len;
                            cb(pod);
                        
                    })
                }
            })
        }
        else {
            cb(null, 'no such pod found')
        }
    })
}

getPodObjMin = (pod, cb) => {
    common.pods.find({ code: pod }, { code: 1, name: 1, art: 1, about: 1 }, (err, data) => {
        if (data[0] != undefined) {
            data = data[0];
            var pod = {
                name: data.name,
                code: data.code,
                art: data.art,
                about: data.about
            }
            cb(pod);
           
        }
        else {
            cb(null, 'no such pod found')
        }
    })
}

getListenersCount = (pod, cb) => {
    common.users.find({ 'onpod.code': pod }, { code: 1 }, (err, d) => {
        if (d != undefined) {
            cb(d.length);
        }
        else {
            cb(null, err)
        }

    })
}
getPodTracks = (pod, cb,sort=false) => {
    console.log('getting pod tracks [getPodTracks]',pod);
    common.pods.findOne({ code: pod }, { songs: 1 }, (err, data) => {
        
        if (data != null) {
            var songs=data.songs;
            if(sort){
                songs=songs.sort((a,b)=>{
                 return  b.added_on - a.added_on
                })
            }
            var res = songs.map((song) => {
                return song.isrc
            })
            console.log('pod tracks has arrived!',res);
            cb(res)
        }
        else {
            cb(null, 'pod not found'+pod)
        }
    })
}

getPodTracksObjs = (pod, cb,sort=false) => {
    console.log('getting pod tracks [getPodTracksObjs]',pod);
    common.pods.findOne({ code: pod }, { songs: 1 }, (err, data) => {
        
        if (data != null&&data != undefined) {
            var songs=data.songs;
            if(sort){
                songs=songs.sort((a,b)=>{
                 return  b.added_on - a.added_on
                })
            }
            var res = songs.map((song) => {
                return song
            })
            console.log('pod tracks has arrived!',res);
            cb(res)
        }
        else {
            cb(null, 'pod not found'+pod)
        }
    })
}

getPodTracksList = (pod, me, cb) => {
    var musickit=new mk();
    var counter = 0;
    var tracks = [];
    common.pods.find({ code: pod }, { songs: 1 }, (err, dat) => {
        if (dat[0] != undefined) {
            var songs = dat[0].songs;
            userkit.getCurrentPod(me, (onpod) => {
                musickit.setUser(me, (acc, err) => {
                    if (acc == null) {
                        cb(null, err)
                    }
                    else {

                        songs.forEach((song) => {
                            musickit.getTrackObj({ isrc: song.isrc }, (obj, err) => {
                                counter++;
                                if (obj != null) {
                                    obj.added_on = song.added_on;
                                    if (onpod != undefined) {
                                        if (onpod.code == pod) {
                                            if (onpod.voted_for != undefined) {
                                                obj.votes = song.votes;
                                            }
                                        }
                                    }

                                    tracks.push(obj)
                                }
                                if (counter >= songs.length) {
                                    cb(tracks)
                                }
                            })
                        })
                    }
                })
            })
        }
        else {
            cb(null, 'pod not found')
        }
    })
}

getPodListeners = (pod, cb) => {
    common.users.find({ 'onpod.code': pod }, { code: 1 }, (err, listeners) => {
        if (listeners != undefined) {
            var res = listeners.map((listener) => {
                return listener.code
            })
            console.log('[getPodListeners-podkit]',pod,res);
            cb(res)
        }
        else {
            cb(null, '[getPodListeners-podkit] ' + err)
        }
    })
}

getMyPodFollowers = (me, cb) => {
    userkit.getCurrentPod(me, (pod, err) => {
        if (pod != undefined) {
            console.log('//////////[getMypodFollowers]////////',pod,me);
            common.users.find({ 'onpod.code': pod.code, 'following.code': me }, { code: 1 }, (err, followers) => {
             
                if (followers != undefined) {
                   
                    var res = followers.map((follower) => {
                        return follower.code
                    })
                     console.log('followers:',res);
                    cb(res)
                }
                else {
                    console.log('no followers found')
                    cb(null, 'no followers found [getMyPodFollower-userkit]')
                }
            })
        }
        else {
            console.error('err while getting current pod [getMyPodFollower-podkit]',err)
            cb(null, 'cannot get current pod [getMyPodFollower-userkit]' )
        }
    })
}



// the array of mates will not be sorted as its not paged. only paged arrays are sent sorted
getMyPodFollowing = (me, cb,podCode) => {

exec=(pod)=>{
        common.users.find({ 'code': me }, { 'following': 1 }, (err, data) => {
                if (data[0] != undefined) {
                    var mates = [];
                    var counter = 0;
                    if(data[0].following.length){
                          data[0].following.forEach((user) => {
                        userkit.getCurrentPod(user.code, (p, err) => {
                            if(p!=undefined){
                                if (p.code == pod) {
                                mates.push(user.code);
                            } 
                            }
                            counter++;
                           console.log('curr following count',counter)
                            if (counter >= data[0].following.length) {
                                console.log('myPodFollowing codes done!',mates);
                                cb(mates);
                            }
                        })
                    }) 
                    }
                 else{
                     cb([])
                 }
                }
                else {
                    cb(null, 'user not found')
                }
            })
}

if(podCode==undefined){
       userkit.getCurrentPod(me, (pod, err) => {
        if (pod != undefined) {
    exec(pod.code)
        }
        else {
            cb(null, '[podKit] err while getting current pod. [userKit] ' + err)
        }
    })
}
 else{
     exec(podCode)
 }
}

checkPodTrack = (isrc, pod, cb) => {
    common.pods.find({ code: pod, 'songs.isrc': isrc }, { code: 1 }, (err, res) => {
        if (res != undefined) {
            if (res.length) {
                cb(true)
            }
            else {
                cb(false)
            }
        }
        else {
            cb(false)
        }
    })
}

vote = (track, me, cb) => {

updateSelf=(me)=>{
    userkit.logTrack(me,track);
livekit.update('/',[me],(usr,done)=>{
done('podUpdate',{voted_for:track})
done('refresh');
})

}


    updateTrack = (podCode) => {
        common.pods.findOne({ code: podCode }, (err, pod) => {
            if (pod != null) {
                var voted = pod.songs.find((song) => {
                    return song.isrc == track
                })
                getPodListeners(podCode, (listeners, err) => {
                    if (listeners == null) {
                        console.error('err while emiting votes [updateTrack-vote-podkit]', err)
                    }
                    else {
                        livekit.update('/songs', listeners, (l, done) => {
                            done('votes', { 'isrc': voted.isrc, 'votes': voted.votes })
                        })
                    }
                })
            }
            else {
                console.error('error get pod track votes [updateTrack-vote-podkit]', err)
            }
        })

    }

    userkit.getCurrentPod(me, (pod, err) => {
        if (pod != undefined) {
            checkPodTrack(track, pod.code, (isValid) => {
                if (isValid) {
                    //updating votes on pod
                    common.pods.updateOne({ code: pod.code, 'songs.isrc': track }, { '$inc': { 'songs.$.votes': 1 } }, {}, (err, r) => {
                        common.users.updateOne({ code: me }, { '$set': { 'onpod.voted_for': track } }, {}, () => {
                            //updating hi5s
                            //CALL LIVE: newVote

                            common.users.findOne({ code: me }, (err, self) => {
                                var counter = 0;
                                emitUserUpdate = () => {
                                    counter++;
                                    if (counter >= self.following.length) {
                                        //will run only once
                                        self.save(() => {
                                            //CALL LIVE: userUpdate to users on this pod and following me
                                            updateTrack(pod.code);
                                            updateSelf(me);
                                            common.users.find({ 'onpod.code': pod.code, 'following.code': me }, { code: 1 }, (err, listeners) => {
                                                
                                                    var codes = listeners.map((l) => {
                                                        return l.code
                                                    })
                                                    livekit.update('/mates', codes, (code, done) => {
                                                        userkit.hasUserVoted(code, (isVoted) => {
                                                            if (isVoted) {
                                                                userkit.getUserObj(me, 'mates', code, (obj) => {
                                                                    if (obj != undefined) {
                                                                        done('userUpdate', obj)
                                                                    }
                                                                    else {
                                                                        done()
                                                                    }
                                                                })
                                                            }
                                                            else {
                                                                done()
                                                            }
                                                        })

                                                    })

                                                
                                                cb(1)
                                            })


                                        })
                                    }
                                }
                                if(self.following.length){
                                         self.following.forEach((user, index) => {

                                    if (user.is_friend) {
                                        userkit.getCurrentPod(user.code, (followingUserPod) => {

                                            if (followingUserPod != undefined) {
                                                //user is a friend as well as on same pod
                                                if (followingUserPod.code == pod.code) {
                                                    if(followingUserPod.voted_for!=undefined&&followingUserPod.voted_for==track){
                                                          self.following[index].hi5++;
                                                    common.users.updateOne({ 'code': user.code, 'following.code': me }, { '$inc': { 'following.$.hi5': 1 } }, (err, usr) => {
                                                        emitUserUpdate();
                                                    })
                                                    }
                                                  else{
                                                    emitUserUpdate()
                                                  }
                                                }
                                                else { emitUserUpdate() }
                                            }
                                            else { emitUserUpdate() }

                                        })

                                        //

                                    }
                                    else {

                                        emitUserUpdate();
                                    }

                                })
                                }
                           else{
                            emitUserUpdate();
                           }
                            })
                        })
                    })
                }
                else {
                    cb(null, 'track not on pod [vote-podKit]')
                }
            })
        }
        else {
            cb(null, 'user is not on any pod [vote-podKit]')
        }
    })

}

reset = (podCode) => {
    var musickit=new mk();
    updatePod = (track,track_length,next_refresh) => {
getPodListeners(podCode,(listeners,err)=>{
if(listeners!=null){
livekit.update('/',listeners,(listener,done)=>{
common.users.findOne({code:listener},(err,l)=>{
if(l!=null){
var trophies=l.onpod.trophies;
done('podUpdate',{
    voted_for:null,
    trophies:trophies,
    now_playing:track,
    track_length:track_length,
    next_refresh:next_refresh
})
done('refresh');
}
else{
    done()
    console.error('err while getting user instance [updatePod-reset-podkit]',err)
}
})
})
}
else{
    console.error('err while getting podListeners [updatePod-reset-podkit]',err)
}
})

    }

    common.pods.findOne({ code: podCode }, (err,pod) => {
        if (pod != null) {
            var prevSong = pod.now_playing;
            var prevLength = pod.track_length;
            var winner = { isrc: null, votes: 0 }
            pod.songs.forEach((song, index) => {
                if (song.votes > winner.votes) {
                    winner = { isrc: song.isrc, votes: song.votes }
                }
                pod.songs[index].votes = 0;
            })
            if (winner.isrc == null) {
                console.log('no one voted, so choosing a random song [reset > podkit]')
                var sel = 0;
                do { sel = Math.floor(Math.random() * Math.pow(10, pod.songs.length.toString().length)) }
                while (sel >= pod.songs.length)
                pod.now_playing = pod.songs[sel].isrc;
            }
            else {
                pod.now_playing = winner.isrc
            }
            musickit.setUser(pod.host, (acc, err) => {
                if (acc != null) {
                    musickit.getTrackLength({ isrc: pod.now_playing }, (Slength) => {
                        if (Slength != null) {
                            pod.next_refresh = common.time() + Slength;
                            pod.track_length = Slength;
                            //now remove voted_for from users and inc trophies 
                            common.users.find({ 'onpod.code': podCode }, (err,listeners) => {
                                var counter = 0;
                                listeners.forEach((listener) => {
                                    if ((winner.isrc!=null)&&(listener.onpod.voted_for == winner.isrc)) {
                                        console.log('trophies++ for',listener.userid)
                                        listener.onpod.trophies=listener.onpod.trophies+1;
                                    }
                                    else{
                                        console.log('user didnt win a trophy');
                                    }
                                    listener.onpod.voted_for = undefined;
                                    listener.following.forEach((foll) => {
                                        listeners.find((l) => {
                                            if (l.code == foll.code) {
                                                foll.together_for = foll.together_for + prevLength;
                                                return true
                                            }
                                            else { return false }
                                        })
                                    })
                                    listener.save(() => {
                                        counter++;
                                        if (counter >= listeners.length) {
                                            pod.save(() => {
                                                setTimeout(() => {
                                                    reset(podCode);
                                                }, Slength);
                                                //CALL podUpdate here
                                                updatePod(pod.now_playing,pod.track_length,pod.next_refresh)
                                                console.warn('pod refreshed successfully!!');
                                              //  cb(1)//
                                            })
                                        }
                                    });
                                })
                            })

                        }
                        else {
                            console.error('cannot get track length [reset > podkit]')
                           // cb(null, 'cannot get track length [reset > podkit]')
                        }
                    })
                }
                else {
                    console.error( 'error while setting host as musickit user [reset > podkit] ' , err);
                    //cb(null, 'error while setting host as musickit user [reset > podkit] ' + err)
                }
            })

        }
        else {
            console.error('pod tried to refresh but pod not found in db [reset > podkit]',err);
            //cb(null, 'pod not found [reset-podkit]')
        }
    })
}


joinPod = (user, pod, cb, role = 'listener') => {
    addUser = () => {
        getMyPodFollowers(user, (followers) => {
            livekit.update('/mates', followers, (f, done) => {
                userkit.getUserObj(user, 'mates', f, (obj) => {
                    if (obj != undefined) {
                        done('addUser', obj);
                    }
                    else {
                        done()
                    }
                })

            })
        })
    }


    userkit.getCurrentPod(user, (onpod) => {
        if (onpod == undefined) {
            var add = {
                code: pod,
                role: role,
                joined_on: common.time(),
                trophies: 0
            }
            common.users.updateOne({ code: user }, { '$set': { 'onpod': add } }, {}, (r, err) => {
                // call live functions: welcome listeners addUser
                getListenersCount(pod, (lCount, err) => {
                    if (lCount == null) {
                        lCount = 500;
                        console.error('could not get pod listeners count [joinPod-userkit]', err)
                    }

                    livekit.update('/', [user], (me, done) => {
                        common.pods.findOne({ code: pod }, (err, mypod) => {
                            if (mypod != null) {
                                var info = {
                                    code: mypod.code,
                                    name: mypod.name,
                                    host: mypod.host,
                                    art: mypod.art,
                                    role: role,
                                    trophies: 0,
                                    voted_for: null,
                                    listeners: lCount,
                                    next_refresh: mypod.next_refresh,
                                    track_length: mypod.track_length,
                                    now_playing: mypod.now_playing
                                }
                                done('welcome', info)
                            }
                            else {
                                console.error('err when getting pod from db which the user just joined needed for welcome event [joinpod-userkit]', err)
                            }
                        })

                    })
                    getPodListeners(pod, (listeners, err) => {
                        if (listeners != null) {
                            livekit.update('/', listeners, (l, done) => {
                                console.log('user joined, emiting podUpdate to',listeners);
                                done('podUpdate', { listeners: lCount })
                            })
                        }
                        else {
                            console.error('error while sending podUpdate listeners update event getting podListeners [joinPod-userkit]', err)
                        }
                    })
                     addUser();
                    cb(1);
                })


            })
        }
        else {
            cb(undefined, 'user already on pod:'+onpod);//later use leavePod
        }
    })
}

leavePod = (user, cb) => {


    emitBye = () => {
        livekit.update('/', [user], (u, done) => {
            done('bye');
        })
    }
    updateListeners = (pod) => {
        getListenersCount(pod, (count, err) => {
            if (count != null) {
                getPodListeners(pod, (listeners, err) => {
                    if (listeners != null) {
                        console.log('user left, emiting podUpdate to',listeners);
                        livekit.update('/', listeners, (l, done) => {
                            done('podUpdate', { listeners: count })
                        })
                       
                    }
                    else {
                        console.error('error while sending podUpdate listeners update event getting podListeners [leavePod-userkit]', err)
                    }
                })
            }
            else {
                console.error('error while getting listeners count [updateListeners-leavePod-userKit]', err)
            }
        })
    }

    emitRemoveUser = (callback) => {
        console.log('update time: removeUser')
        getMyPodFollowers(user, (followers) => {
            console.log('removeUser update to:',followers);
            userkit.getUserId(user,(id)=>{
                if(id!=undefined){
                     livekit.update('/mates', followers, (f, done) => {
             done('removeUser', id);
                })
                }
                else{
                    console.error('err while getting userid for emitRemoveUser [leavepod-podkit]')
                }  
            })
            //callback here cause we only need currpod info till now which needs the user to still be in the pod
            callback()
        })
    }

    userkit.getCurrentPod(user, (onpod) => {
        console.log('getting current pod...')
        if (onpod != undefined) {
            emitRemoveUser(()=>{
                    common.users.updateOne({ code: user }, { '$unset': { onpod: 1 } }, {}, (r, err) => {


                if (onpod.role == 'host') {
                    //emit bye event only
                    console.log('host left stopping pod...');
                     
                    stop(onpod.code, (r, err) => {
                        if (r == null) {
                            console.error('host left,but could not stop pod.', err)
                        }
                        console.log('stop called back!')
                        emitBye();
                        cb(1)

                    })
                }
                else {
                    // call live functions: bye listeners removeUser
                    updateListeners(onpod.code);
                     emitBye();
                   
                    cb(1);
                }
            }) 
            });
       
        }
        else {
            cb(undefined, 'user is not on any pod.');
        }
    })
}


yourSecretMate=(me,txt)=>{
     ////////////test code////////////
 livekit.update('/mates', ["5c1c4eb5720cc", "5c1c4eb5720cd"], (l, done) => {
    done('reply', "hello mate! I'm your secret friend!")
})
/////////////////////////////////
}

welcomeMe=(myCode)=>{

    common.users.findOne({code:myCode},(err,self)=>{
if(self!=null){
    if(self.onpod.code!=undefined){
 livekit.update('/', [myCode], (me, done) => {
        common.pods.findOne({ code: self.onpod.code}, (err, mypod) => {
            if (mypod != null) {
                var info = {
                    code: mypod.code,
                    name: mypod.name,
                    host: mypod.host,
                    art: mypod.art,
                    role: self.onpod.role,
                    trophies: self.onpod.trophies,
                    voted_for: self.onpod.voted_for,
                    next_refresh: mypod.next_refresh,
                    track_length: mypod.track_length,
                    now_playing: mypod.now_playing
                }
                if(info.voted_for==undefined){
                    info.voted_for=null;
                }
                getListenersCount(self.onpod.code,(count,err)=>{
if(count!=null){
info.listeners=count;
  done('welcome', info)
}
else{
    console.error('err while getting pod listeners count [welcomeMe-podkit]')
    done()
}
                })
              
            }
            else {
                console.error('err when getting user\'s pod from db [welcomeMe-userkit]', self.onpod)
            }
        })

    })
    }
    else{
        console.log('user not on any pod [welcomeMe-podkit]')
    }

}
else{
    console.error('err while getting user from db [welcomeMe-podkit]',err)
}
    })
   
}


addSongsToPod=(tracks,podCode,cb)=>{
    console.log('ADDING SONGS TO POD [addSongsToPod-podkit]',tracks,tracks.length)
common.pods.findOne({code:podCode},(err,pod)=>{
    if(pod==null||err!=null){
        console.log('pod not found',err);
        cb(null,'pod not found');
    }
    else{
        //No tracks coiensiding
        tracks.forEach(track => {
            var included= pod.songs.find(song => {
                  if(track==song.isrc){
                       return true
                  }
                  else{
                      return false
                  }
              });
              if(included==undefined){
                    pod.songs.push({isrc:track,added_on:common.time(),votes:0})
              }
             
          });
       pod.save(()=>{
           cb(1)
       })
    }
})
}


removeSongsFromPod=(tracks,podCode,cb)=>{
    console.log('REMOVING SONGS FROM POD [removeSongsFromPod-podkit]',tracks)
common.pods.findOne({code:podCode},(err,pod)=>{
    if(pod==null||err!=null){
        console.log('pod not found',err);
        cb(null,'pod not found');
    }
    else{
        //Make sure each pod track is one of the to-be-removed tracks
    /*  var notIncluded= pod.songs.find(song => {
            if(tracks.includes(song.isrc)){
                 return false
            }
            else{
                return true
            }
        });

        if(notIncluded!=undefined){
            cb(null,notIncluded.isrc+' is not on this pod. Try again.')
        }
        else{
     
        }*/

               //All tracks coiensiding
               pod.songs.forEach((song,index) => {
                   console.log('checking ',song.isrc,index)
                if(tracks.includes(song.isrc)){
                    console.log('removing ',song.isrc,tracks)
                    pod.songs.splice(index,1);
                }
            });
         pod.save(()=>{
             cb(1)
         })
    }
})
}


module.exports = {
    stop: stop,
    getPodObj: getPodObj,
    getListenersCount: getListenersCount,
    getPodTracks: getPodTracks,
    getPodTracksList: getPodTracksList,
    getMyPodFollowing: getMyPodFollowing,
    getMyPodFollowers: getMyPodFollowers,
    getPodListeners: getPodListeners,
    checkPodTrack: checkPodTrack,
    vote,
    reset, 
     joinPod,
     leavePod,
    welcomeMe,
    yourSecretMate,
    getPodTracksObjs,
    getPodObjMin,
    addSongsToPod,
    removeSongsFromPod
}