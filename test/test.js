var core = require('../src/core.js');
core ({
	modules : {
		  "eth" : {
			  "client"   : "slock.me:8545",
			  "contracts" : {
				  "switch" : {
					  adr          : "0xf98dc8f7b740967104f30157f0dcee2bf62493e2",
					  useStorage   : false,
					  useMessage   : true
				  }
			  }  
			  
		  },
		  "websocket" : {
			  host : "slock.me",
			  port : 8080
		  },
		  "debug" : {}
	}
});
