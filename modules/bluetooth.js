var fs  = require("fs");
var cp  = require('child_process');
var rl  = require('readline');

var timeout = 500;
/**
 * Registers a bluetooth-serial port in order to send and receive admin-events
 * 
 * make sure to install bluez-tools or bluez-utils  before using this!
 */

// registers a function to be executed as soon as the file exists.
function waitForConnect(file, cb) {
  fs.exists(file, function (exists) {
     if (exists) cb();
     else        setTimeout(function(){waitForConnect(file,cb);}, timeout);
  });
}

// registers a function to be executed as soon as the file does not exists anymore.
function waitForDiconnect(file, cb) {
  fs.exists(file, function (exists) {
     if (!exists) cb();
     else        setTimeout(function(){waitForDiconnect(file,cb);}, timeout);
  });
}


// open the given Serial Port on the Bluettooth-device
function openPort(channel, device, events) {
   cp.exec("/usr/bin/sdptool add --channel "+channel+" SP", function(error, stdout, stderr) {
      if (error || stdout.indexOf("registered")<=0) {
         console.log(" Error trying to open the bluetooth port " + error + "\n" + stderr+ "\n" +stdout);
         return;
      }
      
      var rfcom = cp.spawn ( "/usr/bin/rfcomm", ['watch',device,channel], {stdio:'inherit'});
      rfcom.on('close', function (code) {
         setTimeout(function(){
            console.log('connection closed, reopen the port.... ' + channel);
            openPort(channel, device, events);
         },500);
      });
      
      
      function startSession(){
           events.emit("adminMsg",{ msg:"Connection to Slock established! Enter 'help' to get all commands!"});
           
           var session = rl.createInterface({  input : fs.createReadStream(device),  output: process.stdout  }); 
           session.on("line",function(cmd) {
              var tokens = cmd.trim().split(" ");
              if (tokens.length>0 && tokens[0].trim().length>0) 
                 events.emit("adminCmd",{name:tokens.shift(), params: tokens});
           });
           
           waitForDiconnect(device, function(){
              console.log("diconnected session");   
               try { session.close(); } catch(err) { console.log(err); }
               waitForConnect(device, startSession);
           });
                    
      }
      waitForConnect(device, startSession);
   });
}



// module-class which registers for incomming admin-Messages to be delivered through the bluettooth serial port
module.exports = function() {
    this.init = function(arg) {
      var config  = arg.config.modules.bluetooth;
      var channel = config.channel || 22;
      var device  = (config.device || '/dev/rfcomm')+channel;
      console.log("start BlueTooth Serial Port "+JSON.stringify(config));
      openPort(channel, device, arg.events);
      
      // register feedback
      arg.events.on("adminMsg",function(arg){
         console.log("BT: "+arg.msg);
         fs.exists(device, function (exists) {
           if (exists) fs.appendFile(device,arg.msg+"\r\n");
        });
      }); 
   };
}
