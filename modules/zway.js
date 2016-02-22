var http = require('http');

module.exports = function() {

   this.init = function(arg) {
	  var config = arg.config.modules.zway;
     console.log("Init zway-connection ...");

	  var host = config.host || 'localhost';
	  var port = config.port || 8083;

     this.events.on('changeState',function(arg) {
    	 var conf = arg.config;
    	 var vOn  = conf.open;
    	 var vOff = conf.close;
       console.log('Zway : open '+arg.id+"="+arg.open);
    	 if (conf.nodeid) {
             var url = "http://"+host+":"+port+"/ZWaveAPI/Run/devices["+conf.nodeid+"].instances["+(conf.instance || 0)+"].commandClasses["+(conf.command || 98)+"].Set("+(arg.open?vOn:vOff)+")";
             console.log('Zway : open '+arg.id+"="+arg.open + " url:"+url);

             http.get(url, function(res) {
            	  console.log("Got response: " + res.statusCode);
            	}).on('error', function(e) {
            	  console.log("Got error: " + e.message);
           	});
    	 }
     });
   };
};
