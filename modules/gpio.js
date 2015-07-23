var fs = require("fs");
var gpioPath = '/sys/class/gpio/';

/**
 *  changes the value of an entry within the gpio-export.
 *  For more Details of available params, see 
 *  https://www.kernel.org/doc/Documentation/gpio/sysfs.txt
 * 
 */
function setGpioValue(pin, param, value, runAfter) {
  fs.writeFile(gpioPath + "gpio" + pin + "/" + param, value, function (err) {
    if (err) throw "Error trying to set the value for " + param + " of pin " + pin + " to " + value + " : " + err;
    console.log("Changed " + param + " of Pin " + pin + " to " + value);
    if (runAfter) runAfter();
	 });
}

/**
 * initializes a pin by writing the pinnumber to /sys/class/gpio/export 
 * and setting the direction to out
 */
function initPin(pin, runAfter) {
  fs.writeFile(gpioPath + "export", pin, function (err) {
    if (err) throw "Error trying to create the pin " + pin + ":" + err;
    fs.exists(gpioPath + "gpio" + pin + "/value", function (exists) {
       if (!exists) throw "The pin "+pin+" could not be initialized. The Directory "+fs.realpathSync(gpioPath + "gpio" + pin)+" does not exist!";
       setGpioValue(pin, "direction", "out", runAfter);
    });
  });
}

/**
 * checks if the pin was exported and initializes if not
 */
function checkPin(pin, runAfter) {
  fs.exists(gpioPath + "gpio" + pin + "/value", function (exists) {
    if (exists)
		    runAfter();
    else
		    initPin(pin, runAfter);
  });
}

/**
 * called from the eventbus whenever we receive a event to change the state of a device
 */
function changeState(arg) {
  if (!arg.config.gpio) return;
  
  console.log('GPIO : open ' + arg.id + "=" + arg.open);
  checkPin(arg.config.gpio, function () {
    setGpioValue(arg.config.gpio, "value", arg.open ? 0 : 1, function() {
      arg.sender.events.emit("changedState", arg);
    });
  });
}

/**
 * only for tests in order to read the set value.
 */
function getGpioValue(pin, param) {
   return fs.readFileSync(gpioPath + "gpio" + pin + "/" + param);
}


/**
 * constructor function which registers the changeState-event
 */
module.exports = function () {
  this.getGpioValue = getGpioValue;
  this.init = function (arg) {
    console.log("Start GPIO ...");
    arg.events.on('changeState', changeState);
  };
};
