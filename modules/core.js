module.exports = function(data) {

	var EventEmitter = require("events").EventEmitter;
	
	// create main-object
	var main = {
	   events : new EventEmitter(),
	   config : data,
	   modules: [],
	};

	// create modules
	Object.keys(main.config.modules).forEach(function(module) {
	    var ModuleClass = require('./'+module+".js"); 
		ModuleClass.prototype.__proto__=main;
		console.log("loading module "+module);
		var m = new ModuleClass();
		if (m.init) main.events.on("init",function() { m.init(main); });
		main.modules.push(m);
	});

	// init all Modules
	main.events.emit("init",main);
	
	return main;
};
