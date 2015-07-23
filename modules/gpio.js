var fs = require("fs");
var gpioPath = '/sys/class/gpio/';


function setGpioValue(pin, param, value, runAfter) {
     fs.writeFile(gpioPath+"gpio"+pin+"/"+param,value, function(err){
		 if (err) throw "Error trying to set the value for "+param+" of pin "+pin+" to "+value+" : "+err;
		 console.log("Changed "+param+" of Pin "+pin+" to "+value);
		 if (runAfter) runAfter();
	 });	   
}

function initPin(pin, runAfter) {
   	fs.writeFile(gpioPath+"export",pin, function(err){
		 if (err) throw "Error trying to create the pin "+pin+":"+err;
		 setGpioValue(pin,"direction","out", runAfter);
	});	
}

function checkPin(pin, runAfter) {
  	fs.exists(gpioPath+"gpio"+pin+"/value",function(exists){
	     if (exists) 
		    runAfter();
		 else 
		    initPin(pin,runAfter);
	});
}

module.exports = function() {
	this.init = function(arg) {
	     console.log("Start GPIO ...");
	     this.events.on('changeState',function(arg) {
			 if (arg.config.gpio) {
	            console.log('GPIO : open '+arg.id+"="+arg.open);
				checkPin(arg.config.gpio, function() {
					 setGpioValue(arg.config.gpio,"value",arg.open?0:1);
				});
			 } 
	     });
	};
};
