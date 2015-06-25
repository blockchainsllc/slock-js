var core = require('../src/core.js');
core ({
	modules : {
		  "eth" : {
			  "client"   : "slock.me:8545",
			  "contracts" : {
				  "doorlock4" : {
					  adr          : "0xf3aa347db02979c366887b01a94e3cafa2b3664c",
					  useStorage   : false,
					  useMessage   : true
				  },
				  "switch" : {
					  adr          : "0xd463562e37cf461411e16b2f7d945b8ddae2bda9",
					  useStorage   : false,
					  useMessage   : true
				  }
			  }  
			  
		  },
		  "websocket" : {
			  host : "127.0.0.1",
			  port : 8080
		  },
		  "debug" : {}
	}
});
