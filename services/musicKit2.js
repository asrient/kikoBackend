/**
 * @ASRIENT 20th July 19
 * * MusicKit [ver 0.2] *
 * Exposes an @object to work with music app services
 * `setUser` `getTrackIsrc` `getTrackLength` `getTrackObj` `getLovedTracks` `checkLovedTrack` `getTrackId`
 * */



var common = require('./common.js');


function musickit(){

    this.spotify = common.newSpotify(),

    this.app=null,

    this.setUser = (usr, callback) => {

console.log('spotify obj ',this.spotify);

    getNewToken = (source, callback) => {
        //refreshing token
        console.log('token will refresh [MusicKit]');
        this.spotify.setRefreshToken(source['refresh_token']);

        this.spotify.refreshAccessToken().then(
             (data)=> {
                console.log('The access token has been refreshed!');
                // Save the access token so that it's used in future calls
                this.spotify.setAccessToken(data.body['access_token']);
                var n_ref = (data.body['expires_in'] * 1000) + common.time();
                console.log(' refresh after? ' + (data.body['expires_in']));
                common.users.updateOne({ 'code': usr }, {
                    '$set': {
                        'source.access_token': data.body['access_token'],
                        'source.next_refresh': n_ref
                    }
                }, {}, (err, r) => {
                    console.log('The access token has been refreshed!');
                    callback(data.body['access_token']);
                })

            },
             (err)=> {
                console.log('Could not refresh access token', err);
                callback(null, err);
            }
        ).catch(
             (err)=> {
                console.log('Could not refresh access token', err);
                callback(null, err);
            }
        );
    }



    common.users.find({ 'code': usr }, { source: 1 }, (err, self) => {
        var source = self[0].source;
        if (source.app == 'spotify') {
            this.app = 'spotify';
            console.log('next_refresh as in db ' + common.time());
            if ((common.time()) < source.next_refresh) {
                //no need to refresh token
                this.spotify.setAccessToken(source.access_token);
                console.log('token obtained from db [MusicKit]');
                console.log('checking the id...');
                this.spotify.getMe().then(
                    (me) => {
                        console.log('access token valid!');

                        // console.log(me);
                        if (me.body.id == source.id) {
                            console.log('user verified!');
                            callback(source.access_token);
                        }
                        else { callback(null, 'spotify user not same as kikoer') }
                    },
                    (err) => {
                        console.log('access token NOT valid!');
                        // console.log(err);
                        getNewToken(source, (tok, err) => {
                            callback(tok, err);
                        })
                    }
                )

            }
            else {
                getNewToken(source, (tok, err) => {
                    callback(tok, err);
                })
            }
        }
        else {
            //code for other apps here
            console.error('user using an invalid app!');

        }
    })
},

this.feedDb = (app, data, cb) => {
    if (app == 'spotify') {
        console.log('/////feeding db with spotify track////////');
        if (data.external_ids.isrc != undefined) {
            var isrc = data.external_ids.isrc;

            common.songs.find({ 'isrc': isrc }, { 'spotifyId': 1 }, (err, res) => {
                if (res[0] != undefined) {
                    //record found!
                    if (res[0].spotifyId != undefined) {
                        console.log('record found with spotifyId on db [feedDb-musickit]');
                        cb(1)
                    }
                    else {
                        // rec found without spotifyid update it
                        var dat = {
                            'spotifyId': data.id,
                            'modified_on': common.time()
                        }
                        common.songs.updateOne({ 'isrc': isrc }, { '$set': dat }, {}, () => {
                            console.warn('record updated with spotifyId [feedDb-musickit]');
                            cb(1);
                        })
                    }
                }
                else {
                    //no record found, creating new
                    console.warn('new record created [feedDb-musickit]');
                    var dat = {
                        'isrc': isrc,
                        'spotifyId': data.id,
                        'title': data.name,
                        'length': data.duration_ms,
                        'modified_on': common.time(),
                        'added_on': common.time()
                    }
                    dat.artists = null;
                    data.artists.forEach(elem => {
                        if (dat.artists == null) {
                            dat.artists = elem.name
                        }
                        else { dat.artists = dat.artists + ',' + elem.name; }
                    });

                    var entry = new common.songs(dat);
                    entry.save((err, r) => {
                        cb(1);
                    })
                }

            })

        }
        else { cb(null) }
    }
    else {
        //code for apple music
        cb(null)
    }
},

this.getTrackLength = (ids, cb) => {
    console.log('///////getting track length////////////');
    this.getTrack(ids, (data, err) => {
        if (data == null) {
            cb(null, err)
        }
        else {
            if (data.length != undefined) {
                cb(data.length);
            }
            else {
                cb(null, 'track length could not be determined.')
            }
        }

    })

},




this.getTrack = (ids, cb) => {
    console.log('//////////[getTrack-musickit]////////////');
   

    getRec= (isrc, err) => {
        if (isrc == null) {
            cb(null, err)
        }
        else {
            common.songs.find({ 'isrc': isrc }, { '_id': 0, 'isrc': 1, 'spotifyId': 1, 'appleMusicId': 1, 'title': 1, 'artists': 1, 'length': 1 },
                (err, data) => {
                    if (data[0] != undefined) {
                        cb(data[0].toObject());
                    }
                    else {
                        cb(null, 'song was not found on db - this should not pop up! [musickit-getRec]');
                    }
                })
        }
    }


    fromSpotifyIsrc = (isrc, cb) => {

       
            console.log('searching track on this.spotify..');
            this.spotify.searchTracks('isrc:' + isrc).then(
                (data) => {
    
                    console.log('search data received from spotify');
    
                    if (data.body.tracks.items.length != 0) {
                        data = data.body.tracks.items;
                        //  console.log(data);
                        var objs = data.filter((elem) => {
                            return elem.external_ids.isrc == isrc
                        });
                        if (objs.length == 0) {
                            console.error('no such track found on spotify!(2)')
                            cb(null, 'no such track found on spotify!(2)')
                        }
                        else {
    
                            this.feedDb('spotify', objs[0], () => {
                                cb(objs[0].id);
                            })
    
                        }
                    }
                    else {
                        console.error('no such track found on spotify!(1)',isrc);
                        cb(null, 'no such track found on spotify!(1)')
                    }
                },
                (err) => {
                    cb(null, err)
                    console.error('error while searching spotify with isrc',err)
                }
            )
    
    
    }
    



        fromSpotifyId = (id, callback) => {
            console.log('getting data from spotify to obtain isrc..');
            this.spotify.getTrack(id).then(
                (data) => {
                    console.log('data received! ');
                    //  console.log(data);
                    data = data.body;
                    if (data.external_ids.isrc != undefined) {
                        var isrc = data.external_ids.isrc;
    
    
    
                        this.feedDb('spotify', data, () => {
                            callback(isrc);
                        })
    
    
    
                    }
                    else {
                        console.error('................Track found without an isrc code!!.............')
                        callback(null);
                    }
    
                },
                (err) => {
                    console.error(err);
    
                    callback(null);
                }
            )
        }
    
        if (ids.isrc != undefined || ids.spotifyId != undefined || ids.appleMusicId != undefined) {
    
            //Check the db for spotifyid by isrc
            var query = {}
            if (ids.isrc != undefined) {
                query.isrc = ids.isrc;
            }
           else if (ids.spotifyId != undefined) {
                query.spotifyId = ids.spotifyId;
            }
           else if (ids.appleMusicId != undefined) {
                query.appleMusicId = ids.appleMusicId;
            }
            if (this.app == 'spotify') {
                //get track obj from spotify 
                console.log('searching db for: ',query);
            common.songs.findOne(query, { 'isrc': 1 ,'spotifyId':1}, (err, song) => {
            
                if (song != null&&song.spotifyId!=undefined) {
                    //spotify id found
                    console.log('isrc code found from db!');
                    getRec(song.isrc);
                }
                else {
                    //spotifyId not found. search it in spotify
                  console.warn('..song not on db..');
    
                        if (ids.spotifyId != undefined) {
                            console.warn('getting track from this.spotify. [getTrack-musickit]',ids)
                            fromSpotifyId(ids.spotifyId, (isrc) => {
    
                                getRec(isrc);
    
                            })
                        }
                        else if (ids.isrc != undefined) {
                            console.warn('getting track from spotify, ISRC was provided only. [getTrack-musickit]',ids)
                            // when isrc is provided but not saved in db and app using is spotify
                            fromSpotifyIsrc(ids.isrc, (res, err) => {
                                if (res != null) {
                                    getRec(ids.isrc);
                                }
                                else {
                                    getRec(null, err);
                                }
                            })
                        }
    
                  
    
    
    
                }
            })


             }
            else if (this.app == 'appleMusic') {
                // get data from apple music
                common.songs.find(query, { 'isrc': 1 ,'appleMusicId':1}, (err, song) => {
                    if (song[0] != undefined&&songs[0].appleMusicId!=undefined) {
                        //spotify id found
                        console.log('isrc code found from db!');
                        getRec(song[0].isrc);
                    }
                    else {
                        //appleMusicId not found. search it in spotify
                      
        
                            if (ids.appleMusicId != undefined) {
                               
                            }
                            else if (ids.isrc != undefined) {
                                // when isrc is provided but not saved in db and app using is spotify
                              
                            }
        
                      
        
        
        
                    }
                })
            }





        }
        else {
            console.error('invalid requset [getTrack-musickit]',ids)
            getRec(null,'invalid requset [getTrack-musickit]');
        }
    
},

this.getTrackFromDB = (isrc,cb) => {
    if (isrc == null) {
        cb(null,'no isrc provided [getTrackFromDB - musickit]')
    }
    else {
        common.songs.find({ 'isrc': isrc }, { '_id': 0, 'isrc': 1, 'spotifyId': 1, 'appleMusicId': 1, 'title': 1, 'artists': 1, 'length': 1 },
            (err, data) => {
                if (data[0] != undefined) {
                    cb(data[0]._doc);
                }
                else {
                    cb(null, 'song was not found on db [musickit-getTrackFromDB]');
                }
            })
    }
},

this.getTrackIsrc = (ids, cb) => {


    console.log('///////////getTrackIsrc////////////');

 this.getTrack(ids,(res,err)=>{
     if(res==null){
         cb(null,err)
     }
     else{
         if(res.isrc!=undefined){
             cb(res.isrc)
         }
         else{
             cb(null,'isrc could not be determined or saved');
         }
     }
 })
},




this.getTrackId = (ids, cb) => {

  

    console.log('///////getSpotifyId///////');

  this.getTrack(ids,(res,err)=>{
if(res==null){
    cb(null,err)
}
else{
    if(this.app=='spotify'){
         if(res.spotifyId!=undefined)
   {
       cb(res.spotifyId)
   } 
   else{
       cb(null,'spotifyId could not be determined.');
   } 
    }
    else if(this.app=='appleMusic'){
        if(res.appleMusicId!=undefined)
  {
      cb(res.appleMusicId)
  } 
  else{
      cb(null,'appleMusicId could not be determined.');
  } 
   }
  
}
  })

},

this.getLovedTracks= (last=0,cb)=>{
    console.log('////////getting liked tracks///////////')
    if(this.app=='spotify'){
          this.spotify.getMySavedTracks({
        limit : 20,
        offset: last
      })
      .then((data)=> {
        console.log('Done!');
   var res=data.body.items.map((elem)=>{
   if(elem.track.external_ids.isrc!=undefined) {
       
        return(elem.track.external_ids.isrc) 
   }
     else{
         console.log('..........A track without isrc found on spotify!.............')
         return(null)
     }
   })
        cb(res,last+20)
      }, (err)=> {
        console.log('Something went wrong!', err);
        cb(null,err);
      });
    }
  else{
      //code for apple music
  }
    
},




this.getTrackObj=(ids,cb)=>{
    console.log('getting track obj for',ids);
      
    /*
    //Songs will not be checked for loved on server, instead its done on client now

    checkLoved=(id,callback)=>{
    if(this.app=='spotify'){
         console.log('checking for loved track in spotify');
        this.spotify.containsMySavedTracks([id])
        .then(function(data) {
     console.log(data.body)
          // An array is returned, where the first element corresponds to the first track ID in the query
          var is_loved = data.body[0];
      
          if (is_loved) {
            console.log('Track was found in the user\'s Your Music library');
    callback(true);
          } else {
            console.log('Track was not found.');
            callback(false);
          }
        }, function(err) {
          console.log('Something went wrong!', err);
          callback(false);
        });
    }
    else{
        //code for apple music
        callback(false);
    }
    }

*/

       this.getTrack(ids,(data,err)=>{
           if(data==null){
               console.error('cannot get track [getTrackObj-musickit]',ids)
               cb(null,err)
           }
           else{
    
            var appId=null;
              var res={
                  title:data.title,
                  artists:data.artists,
                  length:data.length,
                  isrc:data.isrc
              }
              if(this.app=='spotify'){
                res.spotifyId=data.spotifyId;
                appId=data.spotifyId;
               
              }
              else if(this.app=='appleMusic'){
                res.appleMusicId=data.appleMusicId;
                appId=data.appleMusicId;
              }
             /*  checkLoved(appId,(is_loved)=>{
            res.is_loved=is_loved;
            cb(res);
          })*/
          cb(res);///
           }
       })
    }



}


module.exports=musickit;

/*
module.exports = {
    setUser: setUser,
    app: app,
    getTrackIsrc: getTrackIsrc,
    getTrackId: getTrackId,
    getTrackLength: getTrackLength,
    getTrack:getTrack,
    getTrackObj:getTrackObj,
    getLovedTracks:getLovedTracks,
    getTrackFromDB:getTrackFromDB
};
*/