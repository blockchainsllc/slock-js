var utils = require('../src/utils.js');

// 
// this modules receives shh (whisper)-messages in order to send events.
// 

module.exports = function () {

   // we use the events and config from the prototype, because the
   // "watchContract"-event
   // may be triggered before the init-methode is called
   var events = this.events;
   events.on("watchContract", function (contract) {
      
      // get the wisper-object
      var web3       = contract.web3;
      
      // watch for incoming messages
      web3.shh.filter({ 
         // remove the web3.fromAscii if it is fixed!
         'topics': [ web3.fromAscii(utils.normalizeAdr(contract.config.adr)) ] 
      }).watch(function(error,m) {
         events.emit("message", { to: utils.normalizeAdr(contract.config.adr), msg: web3.toAscii(m.payload[0]), from:m.payload[1] });
      });
      
   });
};
