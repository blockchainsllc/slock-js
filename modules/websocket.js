var WebSocketClient = require('websocket').client;
module.exports = function() {
	var events = this.events, wsConfig = this.config.modules.websocket;
	events.on("watchContract", function(contract) {
		var id = contract.config.adr;

		function connect() {
			var client = new WebSocketClient();
			 
			client.on('connectFailed', function(error) {
			    console.log('connectFailed: ' + error.toString());
		            setTimeout(connect, 5000);	
			});
			 
			client.on('connect', function(connection) {
			    console.log('WebSocket Client Connected :'+id);
			    connection.on('error', function(error) {
			        console.log("Connection Error: " + error.toString());
			        setTimeout(connect, 5000);	
			    });
			    connection.on('close', function() {   console.log('echo-protocol Connection Closed '+id);   });
			    connection.on('message', function(message) {
			        if (message.type === 'utf8') {
			            console.log(id+" Received: '" + message.utf8Data + "'");
			            events.emit("message",JSON.parse(message.utf8Data));
			        }
			    });
	
	                    // register with its id in order to be able to get messages
			    connection.sendUTF(JSON.stringify({	cmd : "init", 	adr : id   }));
			});
			client.connect('ws://'+wsConfig.host+':'+wsConfig.port+'/', 'echo-protocol');
		}
		
		// connect to ws-server
		connect();
	});
};
