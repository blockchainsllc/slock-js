function normalizeAdr(a) {
   if (!a) return a;
   if (a.length>2 && a[1]=='x') a=a.substring(2);
   while (a.length<40) a="0"+a;
   return "0x"+a;
}


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
         'topics': [ web3.fromAscii(normalizeAdr(contract.config.adr)) ] 
      }).watch(function(error,m) {
         events.emit("message", { to: normalizeAdr(contract.config.adr), msg: web3.toAscii(m.payload[0]), from:m.payload[1] });
      });
      
   });
};
