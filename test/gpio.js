/// <reference path="../typings/mocha/mocha.d.ts"/>
var assert = require("assert");
var core   = require('../src/core.js');

describe("GPIO", function() {
     
      // create app
      var gpio  = core ({ modules : { "gpio" : {} } }).modules[0];
      function sendEvent(pin,open) {
      	gpio.events.emit("changeState",{ open   : open,	id     : pin,	config : { gpio : pin}, sender : gpio});
      }
     
      it('should initialze the gpio-pin', function(done) {
        gpio.events.once('changedState', function(arg) {
          assert.equal("0"  ,gpio.getGpioValue(3,"value")); 
          assert.equal("out",gpio.getGpioValue(3,"direction")); 
          done(); 
        });
        sendEvent(3,true);   // open pin 3
      });
      
      it('should turn on and off the value the gpio-pin', function(done) {
        gpio.events.once('changedState', function(arg) {
          assert.equal("1"  ,gpio.getGpioValue(3,"value")); 
          
          gpio.events.once('changedState', function(arg) {
             assert.equal("0"  ,gpio.getGpioValue(3,"value")); ;
             done();
          });
          sendEvent(3,true);   // open pin 3
        });
        sendEvent(3,false);   // open pin 3
      });
      
});


