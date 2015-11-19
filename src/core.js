var fs           = require('fs');
var join         = require('path').join;
var EventEmitter = require("events").EventEmitter;

// helper functions
function loadModule(paths, moduleName) {
   var path = null;
   (paths||[]).concat(['../modules/','./lib/node_modules/slock/modules/']).forEach(function(p){
      try { if (!path && fs.accessSync(join(p,moduleName),fs.R_OK ))       path = join(p,moduleName);       } catch (ex){}
      try { if (!path && fs.accessSync(join(p,moduleName)+".js",fs.R_OK))  path = join(p,moduleName)+".js"; } catch (ex){}
   });
   
   return require(path || moduleName);
}

// export the function to create the app
module.exports = function(configData) {
   
	// create app-object
	var app = {
	   events : new EventEmitter(),
	   config : configData,
	   modules: [],
	};

	// create modules
	Object.keys(app.config.modules).forEach(function(module) {
      
		//load  module
	   var ModuleClass = loadModule(configData.modulePaths, module);
	    
	    // assign the prototype, so we can use events and config within the constructor
		ModuleClass.prototype.__proto__=app;
		console.log("loading module "+module);
		
		// instance
		var m = new ModuleClass();
		
		// register the init-method
		if (m.init) app.events.on("init",function() { m.init(app); });
		
		app.modules.push(m);
	});

	// init all Modules
	app.events.emit("init",app);
	
	return app;
};
