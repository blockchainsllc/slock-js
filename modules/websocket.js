var WebSocketClient = require('websocket').client;
function Client(config,events, id) {
	this.id=id;
	var _=this;
	
	function connect() {
		var client = new WebSocketClient();
		 
		client.on('connectFailed', function(error) {
		    console.log('connectFailed: ' + error.toString());
	        if (client.tryReconnect) setTimeout(client.tryReconnect, 5000);	
		});
		 
		client.on('connect', function(connection) {
		    console.log('WebSocket Client Connected :'+id);
		    connection.on('error', function(error) {
		        console.log("Connection Error: " + error.toString());
		        if (client.tryReconnect) setTimeout(client.tryReconnect, 5000);	
		    });
		    connection.on('close', function() {
		        console.log('echo-protocol Connection Closed '+id);
		    });
		    connection.on('message', function(message) {
		        if (message.type === 'utf8') {
		            console.log(id+" Received: '" + message.utf8Data + "'");
		            events.emit("message",JSON.parse(message.utf8Data));
		        }
		    });

		    connection.sendUTF(JSON.stringify({
		    	cmd : "init",
		    	adr : id
		    }));
		});
		client.tryReconnect=connect;
		client.connect('ws://'+config.host+':'+config.port+'/', 'echo-protocol');
	}
	
	connect();
}

function Sockets() {
	var _ = this;
	this.clients = {};
	this.events.on("watchContract", function(contract) {
		_.clients[contract.config.adr]= new Client(_.config.modules.websocket,_.events,contract.config.adr);
	});
}
module.exports = Sockets;