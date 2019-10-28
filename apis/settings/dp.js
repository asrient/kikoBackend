/**
 * @ASRIENT
 * 4th Sept 19
 * @query > custom:T/F, selection
 * @body > file
 */
const fs = require('fs')
var common = require('../../services/common.js');
//var userkit = require('../../services/userKit.js');
var formidable = require('formidable');
var os=require('os');
const backblaze = require("node-backblaze-b2");
let b2 = new backblaze({ accountId: common.vars.b2.id, applicationKey: common.vars.b2.key });

var Jimp = require('jimp');

edit=(file,cb)=>{
  Jimp.read(file)
  .then(image => {
    image.cover(200,200,Jimp.HORIZONTAL_ALIGN_CENTER|Jimp.VERTICAL_ALIGN_MIDDLE)
    image.quality(70);
    var pth=file+'.jpg';
    image.write(pth,()=>{
     deleteLocal(file);
      cb(pth)
  })
  })
  .catch(err => {
    console.error('err in img processing',err)
   cb(null)
  });
}

call = (req, reply) => {
 form= new formidable.IncomingForm();
 form.uploadDir = os.tmpdir();
 form.maxFileSize = 20 * 1024 * 1024;

  /** @sample  reply('SUCCESS',req.query.userid); */
  common.reveal(req, (me) => {
   

   deleteLocal=(path)=>{
    fs.unlink(path, (err) => {
      if (err) {
        console.error('could not unlink file',err)
      }
    })
   }

    deleteFile=(url)=>{
      console.warn('Deleting file '+url);
auth((ready)=>{
if(ready){
   var fileName= url.slice(common.vars.b2.base_url.length)
      b2.getFileInfo({fileName:fileName, bucketId: common.vars.b2.bucket_id }, (err, info) => {
        if(err!=null){
          console.error("could not get file info [detete dp]")
        }
        else{
         var fileId=info.fileId;
         let input = { fileId: fileId, fileName: fileName };
           b2.deleteFile(input, (err) => {
             if(err!=null){
               console.error("could not delete file",err);
             }
             else{
               console.log("file deleted sucessfully");
             }
           });
        }
      })
}
})

    }

setDp=(custom,url)=>{
common.users.findOne({code:me.code},(err,self)=>{
  if(self!=null){
    if(self.info.is_custom_dp!=undefined&&self.info.is_custom_dp==true){
      deleteFile(self.info.dp)
    }
      self.info.is_custom_dp=custom;
      self.info.dp=url;
    self.save(()=>{
      reply('SUCCESS',url)
    })
  }
else{
  if(custom){
    deleteFile(url)
  }
  reply('FAILED','user not found in db')
}
})
}


auth=(cb)=>{
  if(!b2.authorized){
    b2.authorize((err, data) => {
     if(err==null){
       cb(1);
     }
     else{
       console.log("err in auth b2",err);
      cb(0);
     }
    });
  }
  else{
    cb(1);
  }
}

    var custom = false;
    if (req.query.custom != undefined&&(req.query.custom==true||req.query.custom=='true')) {
      custom=true;
    }
    if (me != null) {
      if (custom == false) {
        if (req.query.selection != undefined) {
         var sel=parseInt(req.query.selection);
         if(sel>0&&sel<5){
           setDp(false,'/icon/dp'+sel+'.jpg');
         }
         else{
          reply('FAILED','invalid selection')
         }
        }
        else{
        reply('FAILED','incomplete request data')
        }
      }
      else{
        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error('Error processing the form', err)
            reply('FAILED','Error processing the form')
          }
         
        console.log("dp",files.dp)
        if(files.dp==undefined){
          reply('FAILED','please select a photo')
        }
        else{
          var file=files.dp;
           console.log('tmp file: ',file.path);
           var savedAs=file.path;
                 if(file.type == 'image/jpeg'||file.type =='image/png'){
           //file.path
           edit(savedAs,(r)=>{
             if(r!=null){
               savedAs=r;
              auth((ready)=>{
                if(ready){
                  fname="dp_"+common.time()+"_"+common.code(3)+".jpg";
                  console.log("trying to upload to b2 as ",fname);
                  let input = {
                    bucketId: common.vars.b2.bucket_id,
                    file: savedAs,
                    fileName: fname,
                    contentType: 'image/jpeg', // Optional, mime type to use.
                    retryAttempts: 3  // Optional, how many attempts at an upload. This compensates for the B2 503 on upload.
                  };
                  b2.uploadFile(input, (err, data) => {
                    console.log("data from b2.uploadFile",err,data);
                    if(err!=null){
                      console.err("err while uploading file to b2",err);
                      reply('FAILED','err: could not upload file to b2');
                      deleteLocal(savedAs);
                    }
                    else{
                      setDp(true,common.vars.b2.base_url+fname)
                      deleteLocal(savedAs);
                    }
                  });
                }
                else{
                  reply('FAILED','err: could not authorise b2')
                  deleteLocal(savedAs);
                }
              })
    
             }
             else{
               reply('FAILED','ERR: could not process the image')
               deleteLocal(savedAs);
             }
           })
     
         }
         else{
           reply('FAILED','Sorry, image type not supported.')
           deleteLocal(savedAs);
           console.log('invalid img type:',file);
         }
        }
  
        })
      }
    }
    else {
      reply('FAILED', 'You are not logged in.')
    }
  })
}

module.exports={call:call};