var assert = require("assert");
var core = require('../src/core.js');

describe("GPIO", function() {
   describe("initialize", function(){
     
      // create app
      var app  = core ({ modules : { "gpio" : {} } });
      var gpio = app.modules[0];
      function sendEvent(pin,open) {
      	app.events.emit("changeState",{ open   : open,	id     : pin,	config : { gpio : pin}, sender : gpio});
      }
     
      it('should initialze the gpio-pin', function(done) {
        app.events.once('changedState', function(arg) {
          assert.equals("0"  ,gpio.getGpioValue(3,"value")); 
          assert.equals("out",gpio.getGpioValue(3,"direction")); 
          done(); 
        });
        sendEvent(3,true);   // open pin 3
      });
      
      it('should turn on and off the value the gpio-pin', function(done) {
        app.events.once('changedState', function(arg) {
          assert.equals("1"  ,gpio.getGpioValue(3,"value")); 
          
          app.events.once('changedState', function(arg) {
             assert.equals("0"  ,gpio.getGpioValue(3,"value")); ;
             done();
          });
          sendEvent(3,true);   // open pin 3
        });
        sendEvent(3,false);   // open pin 3
      });
      
   });
});


