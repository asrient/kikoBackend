const express = require('express');
const Router = express.Router;
const common = require('../services/common.js');
//const userkit=require('../services/userKit.js');
/** 
 * @ASRIENT
 * Exposes the function that handels the root of the site.
 */

let mainPage = Router();

var opt = { cID: common.vars.spotify.client_id, PURL: common.vars.permit_url, scopes: common.vars.spotify.scopes };



mainPage.get(['/@(:userid{3})', '/pod/(:podID)', '/pod/songs/add','/pod/listeners','/pods', '/pods/:podsPath', '/people', '/people/find', '/search', '/test','/followers'], (req, res) => {

  var opts = {
    auth: "https://accounts.spotify.com/authorize?client_id=" + opt.cID + "&response_type=code&redirect_uri=" + opt.PURL + "&scope=" + opt.scopes,
    userid: null,
    source: null,
    pod:null
  }

  common.reveal(req, (me) => {
    if (me != null) {
      opts.userid = me.userid;
      opts.source = {
        app: me.source.app,
        access_token: null,
        id: me.source.id
      }
    }

    res.status(200);
    res.type('text/html');
    res.render("app", opts);

  });

}
);



module.exports = mainPage;