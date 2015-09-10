# Module

Each Module as describes in this folders can be configured seperatly and has no direct dependency. 
The Exchange of Data between the modules only works by sending events on the mein-event-bus. 
So the worst case if forgetting to include a module might be, that nobody handles the event and nothng happens. 

## admin

This Module holds a API with commands that can be called in order to configure the slock-system. 
It will react to the [commands](https://github.com/slockit/slock-js#admincmd---event) and execute them.
Adding a custom-Command in your module:

      // add custom command
      arg.events.emit("adminAddCmd", { 
         name    : "contracts",
         comment : "lists all Contracts and their status",
         fnc     : function() {
            var result = "all Contracts: \r\n";
            for (var i = 0; i < contracts.length; i++) {
               var c = contracts[i];
               result+=c.id + ": open= "+c.isStateOpen()+ " + user="+c.getCurrentUser()+" \r\n";
            }
            return result;
         }
      });

The result of a Command will be returned as adminMsg to the admin.
 
## eth

This Module connects the ethereum using the web3-library. As Configuration you must pass the Contracts including their adresses:

    "modules" : {
		  "eth" : {
			  "client"    : "localhost:8545",           // the client references to the json-rpc-port of the ethereum-client
			  "contracts" : { 
				  "doorlock4" : {                         
					  "adr"        : "0x87bb217883541a312fac2977c2a744219963586f",
					  "useStorage" : false,
					  "nodeid"     : 4,
					  "command"    : 98,
					  "open"       : 0,
					  "close"      : 255,
					  "stopOnError": true
				  },
				  "switch" : {
					  "adr"        : "0xd463562e37cf461411e16b2f7d945b8ddae2bda9",
					  "useStorage" : false,
					  "nodeid"     : 2,
					  "stopOnError": true
				  }
			  }  
			  
		  }
        ...
        
## bluetooth

If activated a Bluetooth Serial Port wll be started using the bluez-tools like `rfcomm` and `sdptool`.  So make sure you installed and configured them!

    "modules" : {
		  "bluetooth" : {
           "channel" : 22
           "device"  : "/dev/rfcomm"
         }
        
         

## websocket

The websocket-Module receives messages in realtime through a websocket. These Messages will be send as events and executed and checked in the eth-Module.
If this is a valid message the changeState-event will be triggered.


## gpio

This Module simply reacts to the changeState-Event and changes the value of the gpio-port. That's why you need to add the gpio-pin to the configuration of the contract:

		  "eth" : {
			  "contracts" : { 
				  "doorlock4" : {
                "adr"        : "0xd463562e37cf461411e16b2f7d945b8ddae2bda9",
                "gpio"       : 3
                
                ...
                
## zwave

Using the openzwavelib to send Zwave-signals to the devices:

		  "eth" : {
			  "contracts" : {
				  "doorlock4" : {
					  "adr"        : "0x87bb217883541a312fac2977c2a744219963586f",
					  "nodeid"     : 4,    // the node-id in the z-wave network
					  "command"    : 98,   // the command to use to open/close
					  "open"       : 0,    // the value to set if open
					  "close"      : 255,  // the value to set if closed
                      

         
## zway

If you are using a zway-Server, you might want to use ths module. It will simply send http-requests to the zway-server.
So you must configure the server

        "zway": {
           "host" : "localhost",
           "port" : 8083
        },
		  "eth" : {
			  "contracts" : {
				  "doorlock4" : {
					  "adr"        : "0x87bb217883541a312fac2977c2a744219963586f",
					  "nodeid"     : 4,    // the node-id in the z-wave network
					  "command"    : 98,   // the command to use to open/close
					  "open"       : 0,    // the value to set if open
					  "close"      : 255,  // the value to set if closed
                      

         
            

        
        
