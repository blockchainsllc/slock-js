/**
 * a contract which represents a smartContract
 * in the blockchain connected to a device
 */
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
		config    : {},
		id        : "",
		lastOpen  : "",
		events    : null,
		contract  : null,
		lastNumber: 0,

		/**
		 * triggers the changeState-Event
		 * @param isOpen boolean to indicate the targetState
		 * @param fromMessage if true this is called after receiving a message
		 */
		changeState :function(isOpen, fromMessage) {

			// ignore the trigger if we use messages 
			if (this.config.useMessage && !fromMessage) return; 

			this.events.emit("changeState",{
				open   : isOpen,
				id     : this.id,
				config : this.config,
        sender : this
			});
		},



		/**
		 * called after reveiving a event from the blockchain.
		 * 
		 * It will check if this is a duplictae event and then trigger changeState.
		 * @param isOpen targetState
		 * @param result the result from the blockchain
		 * @param err error-message from last call
		 */
		checkEvent : function(isOpen, result,err) {
			if (err) {
				console.log("Error with "+this.id+" :"+err);
				if (this.config.stopOnError && (""+err).indexOf("INVALID_PARAMS")>=0) 
					process.exit(1);
				return;
			}

			// check last hash (if it is the same event)
			var hash=result.event+"#"+result.hash;
			if (this.lastHash === hash)  return;
			this.lastHash = hash;
			this.lastNumber=result.number;

			// is it already open? -we can ignore it.
			if (!isOpen && !this.lastOpen) return;

			// trigger
			this.changeState(this.lastOpen = isOpen);
		},

		/**
		 * checks if the user sent the message is the one registered or the owner
		 * @param user the user
		 * @returns {Boolean} true|false
		 */
		isAllowed : function(user) {
			return this.getCurrentUser()==user || this.getOwner()==user;
		},

		/**
		 * checks if the current State in the contract is marked as open
		 * @returns {Boolean}
		 */
		isStateOpen :  function() {
			var open = this.storageIsOpen();
			return open!=="0x" && open!=="0x0";
		},

		/**
		 * returns the storage-value of the open-flag
		 * @returns
		 */
		storageIsOpen : function() {
			return this.web3.eth.getStorageAt(this.config.adr,4);
		},

		/**
		 * returns the current user of the contract
		 * @returns
		 */
		getCurrentUser : function() {
			return this.web3.eth.getStorageAt(this.config.adr,3);
		},

		/**
		 * returns the current user of the contract
		 * @returns
		 */
		getOwner : function() {
			return this.web3.eth.getStorageAt(this.config.adr,0);
		},

		/**
		 * reads the storage value and compares it to the last.
		 * If it changed, it will trigger changeState
		 */
		checkStorage : function() {
			// read openCount
			var open = this.storageIsOpen();
			if (open!==this.lastOpen) {
				this.lastOpen = open;
				this.changeState(open!=="0x" && open!=="0x0");
			}
		},

		/**
		 * starts the polling-threads depending on the config
		 */
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

			this.events.emit("watchContract", this);
		},

		/**
		 * stops the polling
		 */
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


/**
 * the module with the init-function.
 */
module.exports = function() {
	var contracts = [];

	function handleMessage(msg) {
		contracts.forEach(function(c) {
			if (c.config.adr==msg.to && c.storageIsOpen() && c.isAllowed(msg.from))
				// now send open-event
				c.changeState(msg.msg.indexOf("open")>=0, true);
		});  
	}

	/**
	 * initialze or entry-function of the module
	 */
	this.init =  function(arg) {
		var config = arg.config.modules.eth;
		console.log("Init contracts for client "+config.client);

		// stop if this is a reinit
		if (arg.oldConfig)
			contracts.forEach(function(c) {	 c.stopWatching();   });  
		else
			arg.events.on("message",handleMessage);
		contracts.length = 0;

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


