/**
 * simple Module to write the event to the logger instead executing it.
 */
module.exports = function() {
	this.init = function(arg) {
	     console.log("Start Debug...");
	     this.events.on('changeState',function(arg) {
	         console.log('Debug : open '+arg.id+"="+arg.open);
	     });
	};
};