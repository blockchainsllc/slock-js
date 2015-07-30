var fs  = require("fs");
var cp  = require('child_process');
var os  = require('os');
var util= require('util');

function API() {
   var self =this;
   this.events.on("adminAddCmd", function(cmd){
      API.prototype[cmd.name]=cmd.fnc;
      if (cmd.comment) API.prototype[cmd.name+"_"]=cmd.comment;
   });
   
   this.init=function(arg) {
      arg.events.on("adminCmd", function(cmd){
         console.log("Admin CMD : "+cmd.name + " "+JSON.stringify({params: cmd.params}));
         
         if (self[cmd.name]) {
            var results = self[cmd.name].apply(self,cmd.params);
            if (results)
                arg.events.emit("adminMsg", { cmd:cmd, msg: results });
         }
         else
           arg.events.emit("adminMsg", { cmd:cmd, msg: "The Cmd "+cmd.name+" could not be found!"});
      });
   };
   
   this.exec = function(cmd, cb) {
      var self = this;
      if (util.isArray(cmd)) {
         if (cmd.length==1) cmd = cmd[0];
         else {
            var array = cmd;
            cmd = array.shift();
            cb = function() {   self.exec(array);   };
         } 
      }
      
       console.log("exec "+cmd);
       cp.exec(cmd, function(error, stdout, stderr) {
          if (error)    self.events.emit("adminMsg", { cmd:cmd, msg:"Error executing "+cmd+"\n"+stderr+"\n"+stdout});
          else if (cb)  cb(stdout, stderr);
       });
   };
};
module.exports = API;
var api = API.prototype = {

   wlan_: "configures the wlan : wlan SSID PASSWD",
   wlan : function(name,passwd) {
      this.exec([
         "wpa_passphrase "+name+" \""+passwd+"\" > /etc/wpa_supplicant/wpa_supplicant.conf",
         "systemctl restart network-wireless@wlan0.service"
      ]);
      return "set wlan name "+name+" passwd "+passwd;
   },

   reboot_: "reboots the slock",
   reboot : function(name,passwd) {
      var _ = this;
      setTimeout(function(){ _.exec("reboot");   },500);
      return "rebooting ....";
   },



   help_: "shows all available Commands",
   help : function() {
      var all = "Commands for Slock:\r\n";
      for (var cmd in api) {
         if(api.hasOwnProperty(cmd) && cmd.match("_$")!="_")  all+=" - "+cmd+"\r\n"+(api[cmd+'_'] ? (api[cmd+'_']+"\r\n"):"");
      }
      return all;
   },
   
   
   ip_ : "shows all assigned ipadresses",
   ip  : function(){
      var ips = "";
      var ifaces = os.networkInterfaces();
      Object.keys(ifaces).forEach(function (ifname) {
         ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) return;
            ips+=" - "+ifname+": "+iface.address +"\r\n";
         });
      });
      return ips;      
   },
   
    
   scan_ : "scans the wlan networks",
   scan  : function(){
      var self=this;
      this.exec("iwlist wlan0 scan", function(std,err) {
         var matches = std.match(/ESSID:\".+?\"/g), all="WLAN-Networks:\r\n";
         if (matches) {
             for (var i = 0; i < matches.length; i++) all+=matches[i].substr(6)+"\r\n";
         } 
         self.events.emit("adminMsg", {msg:all});
      });
   }, 

   sh_ : "executes a comand on the shell",
   sh  : function(cmd){
      this.exec( Array.prototype.slice.call(arguments).join(' '), function(std,err) {
         self.events.emit("adminMsg", {msg:std+err});
      });
   } 

}

