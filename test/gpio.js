var core = require('../src/core.js');
var main = core ({
	modules : {
		  "gpio" : {}
	}
});

function sendEvent(pin,open) {
	main.events.emit("changeState",{
				open   : open,
				id     : pin,
				config : { gpio : pin}
	});
}

sendEvent(3, true);
setTimeout(function(){
   sendEvent(3, false);
	setTimeout(function(){
	   sendEvent(3, true);
	},2000);
},2000);





