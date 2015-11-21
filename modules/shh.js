module.exports = function () {

   // we use the events and config from the prototype, because the
   // "watchContract"-event
   // may be triggered before the init-methode is called
   var events = this.events, shhConfig = this.config.modules.shh;
   events.on("watchContract", function (contract) {
      
      // get the wisper-object
      var web3       = contract.web3;
      var replyWatch = web3.shh.watch({ 'topic': [ web3.fromAscii(contract.config.adr) ] });
      replyWatch.arrived(function(m) {
         events.emit("message", { to: contract.config.adr, msg: web3.toAscii(m.payload[0]), from:web3.toAscii(m.payload[1])});
      });
      
   });
};
