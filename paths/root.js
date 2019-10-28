const express = require('express');
const Router = express.Router;
const common=require('../services/common.js');
/** 
 * @ASRIENT
 * Exposes the function that handels the root of the site.
 */

let root=Router();

var opt={cID:common.vars.spotify.client_id,PURL:common.vars.permit_url,scopes:common.vars.spotify.scopes};

var opts={auth:"https://accounts.spotify.com/authorize?client_id="+opt.cID+"&response_type=code&redirect_uri="+opt.PURL+"&scope="+opt.scopes}

 root.get('/',(req,res)=>{
  
    common.reveal(req,(me)=>{
      if(me==null)
     {

  res.status(200);
    res.type('text/html');
      res.render("login",opts);
    }
     else{
      res.redirect('/pods');
     } 
    });
  })

module.exports=root;