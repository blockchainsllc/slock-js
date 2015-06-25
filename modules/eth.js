function Contract(id,config,events,web3) {
	this.config = config;
	this.id= id;
	this.events=events;
	this.web3=web3;
    var EContract = web3.eth.contract([
      { name: 'Open',           type: 'event',      inputs: [],   outputs: []  },
      { name: 'Close',          type: 'event',      inputs: [],   outputs: []  },
    ]);
    this.contract = EContract.at(config.adr); 
}

Contract.prototype = {
   config   :{},
   id       :"",
   lastOpen : "",
   events   : null,
   contract :null,
   lastNumber:0,
   
   changeState :function(isOpen, fromMessage) {
	   
	   if (this.config.useMessage && !fromMessage) return; 
	   
	   this.events.emit("changeState",{
		   open   : isOpen,
		   id     : this.id,
		   config : this.config
	   });
   },
   
   
   
   checkEvent : function(isOpen, result,err) {
//	   console.log("got event for "+this.id+" : #"+result.number+" "+result.event+" hash:"+result.hash+" :"+err);
	   if (err) {
		   console.log("Error with "+this.id+" :"+err);
		   return;
	   }
	   var hash=result.event+"#"+result.hash;
	   if (this.lastHash === hash)  return;
	   this.lastHash = hash;
	   this.lastNumber=result.number;
	   if (!isOpen && !this.lastOpen) return;
	   
   	   this.changeState(this.lastOpen = isOpen);
   },
   
   isAllowed : function(user) {
	   //TODO confirm the user of the message
	  return true;  
   },
   
   isStateOpen :  function() {
	   var open = this.storageIsOpen();
	   return open!=="0x" && open!=="0x0";
   },
   
   storageIsOpen : function() {
	   return this.web3.eth.getStorageAt(this.config.adr,4);
   },
   
   checkStorage : function() {
	  // read openCount
      var open = this.storageIsOpen();
      if (open!==this.lastOpen) {
    	  this.lastOpen = open;
    	  this.changeState(open!=="0x" && open!=="0x0");
      }
   },
   
   startWatching : function() {
	   console.log("start watching "+this.id);
	   var _=this;
	   if (this.config.useStorage) 
		   this.timer = setInterval(function(){_.checkStorage();}, (this.config.interval||1) *1000);
	   else {
		   this.openEvent  = this.contract.Open();  
		   this.closeEvent = this.contract.Close();
		   this.openEvent.watch (function(err,result){_.checkEvent(true, result,err);});
		   this.closeEvent.watch(function(err,result){_.checkEvent(false, result,err);});
	   }
	   
	   if  (this.config.useMessage) 
		    this.events.emit("watchContract", this);
		   
   },
   
   stopWatching : function() {
	   console.log("stop watching "+this.id);
	   if (this.config.useStorage) 
		   clearInterval(this.timer);
	   else if (this.openEvent){
		   this.openEvent.stopWatching();
		   this.closeEvent.stopWatching();
	   } 
		   
   }
   
};

function Eth() {}
Eth.prototype = {
		
   contracts : [],
   
   handleMessage : function(msg) {
       this.contracts.forEach(function(c) {
    	   if (c.config.adr==msg.to && c.storageIsOpen() && c.isAllowed(msg.from))
	    		   // now send open-event
	    		   c.changeState(msg.msg.indexOf("open")>=0, true);
       });  
   },
		
   init : function(arg) {
	 var config = arg.config.modules.eth, _=this;
     console.log("Init contracts for client "+config.client);
     
     // stop if this is a reinit
     if (arg.oldConfig)
       this.contracts.forEach(function(c) {	 c.stopWatching();   });  
     else
       arg.events.on("message",function(msg) { _.handleMessage(msg);});
     
     var contracts = this.contracts=[];
     
     // init the provider
     var web3 = this.web3 = this.web3 || require('web3'), events = this.events;
     if (!arg.oldConfig || config.client!=arg.oldConfig.modules.eth.client)
       web3.setProvider(new web3.providers.HttpProvider('http://'+config.client));
     
     // init the contracts
     Object.keys(config.contracts).forEach(function(cid) {
    	var c = new Contract(cid, config.contracts[cid],events,web3);
        c.startWatching();
        contracts.push(c);
 	 });     
     
     
   }
};

module.exports = Eth;
