var fs   = require('fs');
var core = require('./core.js');

function Config() {}
Config.start = function(configFile) {
	// read the config-file...
	fs.readFile(configFile,'utf-8', function(err, data) {
		// handle error
		if (err) 
			console.log("Could not read the "+configFile+"  :"+err);
		else {
			// start the application with the loaded config.
		    var main = core(JSON.parse(data));
		    
			function reinit(err, data,count) {
				if (err) return;
				var conf={};
				try {
					conf = JSON.parse(data);
				} catch (e) {
					if (!count || count<5)
						setTimeout(function(){fs.readFile(configFile,'utf-8', function(a1,a2) {reinit(a1,a2,(count||0)+1)});},500);
					else
					   console.log("Error trying to update from the config "+configFile);
					return;
				}
				if (JSON.stringify(conf)==JSON.stringify(main.config)) return;
		    	console.log("Config file ("+configFile+") changed. Reloading...");
				main.oldConfig = main.config;
				main.config    = conf;
				main.events.emit("init",main);
			}	

			// watch the config for changes and call reinit
		    fs.watch(configFile,function (event, filename){
		    	fs.readFile(configFile,'utf-8', reinit);
		    });
		}
	});
};

module.exports = Config;