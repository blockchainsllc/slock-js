module.exports = function () {

   // we use the events and config from the prototype, because the
   // "watchContract"-event
   // may be triggered before the init-methode is called
   var events = this.events;
   events.on("watchContract", function (contract) {
      
      // get the wisper-object
      var web3       = contract.web3;
      
      // watch for incoming messages
      web3.shh.watch({ 
         'topic': [ web3.fromAscii(contract.config.adr) ] 
      }).arrived(function(m) {
         events.emit("message", { to: contract.config.adr, msg: web3.toAscii(m.payload[0]), from:web3.toAscii(m.payload[1])});
      });
      
   });
};
