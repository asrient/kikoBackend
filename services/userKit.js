/**
 * @ASRIENT
 * Exposes a func that returns proper api reply data for a user in lists: @IDcard @people @mates @followers @podPeople
 * */


var common = require('./common.js');
var mk = require('./musicKit2.js');


filter = (arr, code, callback) => {


}

//in code.
// me->uCode relation.
// Who's uCode to me.
/**
 * @following = I am following uCode
 * @follower = uCode is my follower
 * @self = uCode is myself
 * @none = no relationship
 */


logTrack=(me,track)=>{
common.users.findOne({code:me},(err,self)=>{
if(self!=null){
 var index=-1;
  index= self.top_songs.findIndex((entry)=>{
return(track==entry.id)
 })
 if(index<0){
//add new record
self.top_songs.push({id:track,frequency:1,last_modified:common.time()})
 }
 else{
    self.top_songs[index].frequency++;
    self.top_songs[index].last_modified=common.time();
 }
 self.save();
}
})
}


getRelation = (me, uCode, callback) => {

    var relation = 'none';
    if (me == uCode) {
        relation = 'self';
    }
    var reply = {};

    // Determine Relation
    common.users.find({ 'code': me, 'following.code': uCode },
        {
            'following.code': 1,
            'following.is_friend': 1,
            'following.together_for': 1,
            'following.hi5': 1
        }, (err, data) => {

            if (data[0] != undefined) {


                if (data[0].following[0] != undefined) {

                    //
                    relation = 'following';

                    var res = data[0].following.filter((o) => { return o.code == uCode });
                    res = res[0];

                    reply = res;
                    if (res.is_friend) {
                        relation = 'friend';
                    }
                    //
                }
                reply.relation = relation;
                // console.log(reply);
                callback(reply);
            }

            else {
                common.users.find({ 'code': uCode, 'following.code': me }, { 'following.code': 1, 'together_for': 1 }, (err, data) => {
                  if(data==undefined){console.error('err wile getting rel ',uCode,me,err)}
                    if (data[0] != undefined) {

                        relation = 'follower';

                        if (data[0].following[0] != undefined) {
                            var res = data[0].following.filter((o) => { return o.code == me });
                            res = res[0];

                            reply = res;

                        }
                    }

                    reply.relation = relation;

                    callback(reply);
                })
            }


        })
}




getCurrentPod = (code, callback) => {
    if(code!=null){
          common.users.find({ 'code': code }, { 'onpod': 1 }, (err, data) => {
        if (data[0] != undefined) {

            if (data[0].onpod.code != undefined) {
                console.log(data[0]._doc.onpod);
                callback(data[0]._doc.onpod);
            }
            else { callback(undefined) }
        }
        else {
            callback(undefined);
        }
    }) 
    }
 else{
     callback(undefined)
 }
}




getUserCode = (uid, callback) => {
    console.log('getting user code for',uid);
    common.users.find({ 'userid': uid }, { 'code': 1 }, (err, data) => {
        if (data[0] != undefined) {
            data = data[0].code;
            callback(data);
        }
        else {
            callback(undefined);
        }
    });

}

getUserId = (code, callback) => {
    console.log('getting userid for',code);
    common.users.find({ 'code': code }, { 'userid': 1 }, (err, data) => {
        if (data[0] != undefined) {
           var dat = data[0].userid;
            callback(dat);
        }
        else {
            callback(undefined);
        }
    });

}



hasUserVoted = (user, cb) => {
    common.users.findOne({ code: user }, (err, usr) => {
        if (usr == undefined) {
            cb(false)
        }
        else {
            if (usr.onpod != undefined) {
                if (usr.onpod.voted_for != undefined) {
                    cb(true, usr.onpod.voted_for);
                }
                else {
                    cb(false)
                }
            }
            else {
                cb(false)
            }
        }
    })
}

getUserObj = (code, type, me, callback) => {




    var reply = {};




    var fields = { '_id': 0, 'userid': 1, 'info.dp': 1 };

    if (type == 'IDcard') {
        fields.top_songs = 1;
        fields['info.name'] = 1;
        fields['info.links'] = 1;
        fields.followers_count = 1;
    }

    common.users.find({ 'code': code }, fields, (err, data) => {
        if (data[0] != undefined) {
            data = data[0];
            if (type == 'IDcard') {
                reply = {
                    name: data.info.name,
                    followers_count: data.followers_count,
                    links: data.info.links
                }
            }

            reply.userid = data.userid,
                reply.dp = data.info.dp;

            //   console.log(reply);


            getRelation(me, code, (r) => {
                //  console.log(r);
                var rel = r.relation;
                reply.relation = rel;
                if (rel == 'friend' && r.hi5 != undefined) {
                    reply.hi5 = r.hi5;
                }
                if ((rel == 'follower' || rel == 'following' || rel == 'friend') && r.together_for != undefined) {
                    reply.together_for = r.together_for;
                    // console.log(r.together_for);
                }


                if (rel == 'following' || rel == 'friend') {

                    if (type == 'IDcard' || type == 'people' || type == 'followers') {
                        //pod with pod info
                        getCurrentPod(code, (pod) => {
                            if (pod != undefined) {
                                common.pods.find({ 'code': pod.code }, { 'name': 1, 'art': 1 }, (err, pdat) => {
                                    if (pdat[0] != undefined) {
                                        pdat = pdat[0];
                                        reply.pod = {
                                            'name': pdat.name,
                                            'code': pod.code,
                                            'art': pdat.art,
                                            'role': pod.role,
                                            'trophies': pod.trophies
                                        }
                                    }
                                   callback(reply);
                                })
                            }
                            else{
                                 callback(reply);
                            }
                           
                        })
                    }
                    else if (type == 'mates') {
                        //pod with voted song info

                        var match = false;
                        getCurrentPod(code, (pod) => {
                            if (pod != undefined && pod.code != undefined) {
                                //   console.log(pod);

                                getCurrentPod(me, (mypod) => {///
                                    reply.pod = { 'trophies': pod.trophies };//
                                    if (mypod != undefined && mypod.code != undefined) {


                                        if (mypod.code == pod.code) {
                                            //On same pod.
                                            if (mypod.voted_for != undefined) {
                                                if (pod.voted_for != undefined) {


                                                    //////////////CALL TRACK OBJECT FUNC HERE////////////
                                                      var musickit=new mk();
                                                    musickit.setUser(me, (acc, err) => {
                                                        if (acc != null) {
                                                            musickit.getTrack({ 'isrc': pod.voted_for }, (song, err) => {
                                                                reply.pod.voted_for = song;
                                                                if (pod.voted_for == mypod.voted_for) {
                                                                    match = true;
                                                                }
                                                                reply.pod.is_match = match;//
                                                                callback(reply);
                                                            })
                                                        }
                                                        else {
                                                            console.error('err while setting user [userObj-userkit]');
                                                            callback(reply);
                                                        }
                                                    })




                                                }
                                                else {
                                                    //return pod with only trophies data
                                                    console.log('[userObj] me voted but target not voted')
                                                    callback(reply)
                                                }



                                            }
                                            else {
                                                //return pod with only trophies data
                                                console.log('[userObj] me not voted ')
                                                callback(reply)
                                            }
                                        }
                                        else {
                                            //me nd user on different pod
                                            callback(reply)
                                        }
                                    }
                                    else {
                                        //me is not on any pod
                                        callback(reply)
                                    }
                                })///



                            }
                            else {
                                //target user not on any pod, so pod data will not be provided
                                callback(reply);
                            }

                        })





                    }
                    else {
                        callback(reply);
                    }
                }
                else {
                    callback(reply);
                }

            })
        }
        else { callback(undefined); }//no user found
    })

}

/** 
get @userid @name @dp
*/
getUserObjMin = (user, callback) => {
    common.users.find({ 'code': user }, { 'userid': 1, 'info.name': 1, 'info.dp': 1 }, (err, data) => {
        if (data[0] == undefined) {
            callback(undefined, 'user not found');
        }
        else {
            var d = data[0]
            callback({ 'userid': d.userid, 'name': d.info.name, 'dp': d.info.dp });
        }
    })
}

follow = (user, me, callback) => {
    getRelation(me, user, (r) => {
        if (r.relation == 'following' || r.relation == 'friend') {
            callback(0, "you are follwing them already!")
        }
        else if (r.relation == 'self') {
            callback(0, "can't follow yourself");
        }
        else {
            var fdata = {
                'code': user,
                'added_on': common.time(),
                'last_time': common.time(),
                'together_for': 0,
                'is_friend': false
            }
            if (r.relation == 'follower') {
                fdata.is_friend = true;
                fdata.hi5 = 0;
            }
            common.users.updateOne({ 'code': me }, { '$push': { 'following': { '$each': [fdata], '$sort': { 'last_time': -1, 'together_for': -1, 'is_friend': 1, 'added_on': -1 } } } }, {}, (err, d) => {
                //My record updated now!

                //followers_count++ for all rel & set is_frient last_time if user is already following me.
                var on = { 'code': user };
                var action = {
                    '$inc': { 'followers_count': 1 },
                }
                if (fdata.is_friend) {

                    action['$set'] = {
                        'following.$.hi5': 0,
                        'following.$.last_time': common.time(),
                        'following.$.is_friend': fdata.is_friend
                    }

                    on['following.code'] = me;
                }
                common.users.updateOne(on, action, {}, (err, d) => {

                    /////////////////////CODE TO CALL LIVE FUNCS HERE/////////////////////

                    callback(1);
                })
            })
        }
    })
}





unfollow = (user, me, callback) => {
    getRelation(me, user, (r) => {
        if (r.relation == 'follower' || r.relation == 'none') {
            callback(0, "You were not following them anyways!")
        }
        else if (r.relation == 'self') {
            callback(0, "can't unfollow yourself");
        }
        else {


            common.users.updateOne({ 'code': me }, { '$pull': { 'following': { 'code': user } } }, {}, (err, d) => {
                //My record updated now!

                //followers_count++ for all rel & set is_frient last_time if user is already following me.
                var on = { 'code': user };
                var action = {
                    '$inc': { 'followers_count': -1 },
                }
                if (r.relation == 'friend') {

                    action['$unset'] = {
                        'following.$.hi5': 1,
                    }
                    action['$set'] = {
                        'following.$.is_friend': false
                    }

                    on['following.code'] = me;
                }
                common.users.updateOne(on, action, {}, (err, d) => {

                    /////////////////////CODE TO CALL LIVE FUNCS HERE/////////////////////

                    callback(1);
                })
            })
        }
    })
}





getUserFollowing = (user, cb, paged = false, start = 0) => {
    var slice = 1;
    start = parseInt(start);
    if (paged) {
        slice = { '$slice': [start, 20] }
    }
    common.users.updateOne({ 'code': user }, {
        '$push': {
            'following': {
                '$each': [], '$sort': {
                    'last_time': -1,
                    'together_for': -1,
                    'is_friend': 1,
                    'hi5': -1,
                    'added_on': -1
                }
            }
        }
    }, {}, (err, d) => {
        common.users.find({ 'code': user }, { 'following': slice }, (err, data) => {
            if (data[0] != undefined) {
                var res = data[0].following.map((usr) => {
                    return usr.code
                })
                cb(res, (start + data[0].following.length));
            }
            else {
                cb(undefined, err)
            }
        })
    })


}

getUserFollowers = (user, cb, start = 0) => {
    var slice = 1;
    start = parseInt(start);
    
   
    common.users.find({ 'following.code': user }, { 'code': 1 }, (err, data) => {
        if (data != undefined||data != null) {
           var res=[];
             res = data.map((usr) => {
                return usr.code
            })
            cb(res, (start + data.length));
        }
        else {
            cb(undefined, err)
        }
    }).sort({'following.$.added_on':1}).skip(start).limit(20)
}

module.exports = {
    getUserObj: getUserObj,
    getRelation: getRelation,
    getCurrentPod: getCurrentPod,
    getUserCode: getUserCode,
    getUserObjMin: getUserObjMin,
    follow: follow,
    unfollow: unfollow,
    getUserFollowing: getUserFollowing,
    hasUserVoted: hasUserVoted,
    getUserId,
    getUserFollowers,
    logTrack
};