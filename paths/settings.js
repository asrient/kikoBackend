const express = require('express');
const Router = express.Router;
const common=require('../services/common.js');
/** 
 * @ASRIENT
 * 6.9.19
 * Exposes the function that handels the settings page.
 */

let root=Router();



 root.get('/settings',(req,res)=>{
  
    common.reveal(req,(me)=>{
      if(me!=null)
     {
       common.users.findOne({code:me.code},(err,me)=>{
        if(me!=null){
 var opts={userid:me.userid,name:me.info.name,dp:me.info.dp,links:me.info.links,email:me.info.email,created_on:me.created_on}      
  res.status(200);
    res.type('text/html');
      res.render("settings",{vars:opts});
        }
        else{
          res.render("error",{err:'Cant the find user'})
        }
       })
 
    }
     else{
      res.redirect('/');
     } 
    });
  })

module.exports=root;