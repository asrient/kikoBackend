/**
 * @ASRIENT
 * created on 20,April 2019.
 * #DEFINES 
 * Schema & Model for users collection of the db.
 * Schema & Model for pods collection of the db.
 */
var mongoose = require('mongoose');

let user = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    userid: { type: String, unique: true },
    ticket: { type: String, unique: true },
    created_on: Number,
    last_seen: Number,
    info: {
        name: String,
        email: String,
        links: { spotify: String, fb: String, ig: String, twitter: String, youtube: String },
        birthdate: String,
        dp: String,
        is_custom_dp:Boolean,
        country: String
    },
    onpod: {
        code: { type: String, unique: false },
        role: String,
        joined_on: Number,
        voted_for: String,
        trophies: Number
    },
    source: {
        app: String,
        id: String,
        access_token: String,
        refresh_token: String,
        next_refresh: Number
    },
    following: [{ code: String, is_friend: Boolean, together_for: Number, hi5: Number, last_time: Number, added_on: Number }],
    followers_count: Number,
    top_songs: [{ id: String, frequency: Number, last_modified: Number }]
})


var users = mongoose.model('users', user);





let pod = new mongoose.Schema({
    code: String,
    name: String,
    about: String,
    host: String,
    art: String,
    next_refresh: Number,
    track_length:Number,
    now_playing: String,
    started_on: Number,
    songs: [{
        isrc: String,
        added_on: Number,
        votes: Number
    }]
});

var pods = mongoose.model('pods', pod);




let song = new mongoose.Schema({
    isrc: String,
    spotifyId: String,
    appleMusicId: String,
    streams_count: Number,
    title: String,
    artists: String,
    length: Number,
    modified_on: Number,
    added_on: Number
});

var songs = mongoose.model('songs', song);


let visit = new mongoose.Schema({
    page:String,
    source:Object,
   time:Number,
   ip:String,
   user:String
});

var visits = mongoose.model('visits', visit);





module.exports = { users: users, pods: pods, songs: songs, visits };