# slock-js
the backend of the slock framework

## Module-Configuration

Each Module will be created only if used within the config. The key is the filename without the ending:

	 "modules" : {
		  "eth"   : { ... },  // -> will load the file modules/eth.js
		  "zwave" : { ... }   // -> will load the file modules/zwave.js
	  }
 

For more details on the different Modules and their config, see [the module-directory](https://github.com/slockit/slock-js/tree/master/modules).

## Module Creation

Each Module which is specified in the config will be created during startup. A Module will be loaded by searching within the modules-Directory and requiring this file. The module.export must be class which will be used to create the instance.

	function Eth() {}
	module.exports = Eth;
 
## Events

Each Module can define any kind of event in order tocommunicate with eachother, but these are the ones created from the main-modules:

### Events from the core-Module

#### "init"-Event

After creating all Instances the Init-Method (if existing) will be called. This is a special behavior, because it will give you an easier start-point.
The object passed as argument will give you the following properties:

- 	 <b>events</b> : a EventEmitter in order to register on the event-bus
-	   <b>config</b> : the configuration as read from the config.json (or passed in)
-	   <b>modules</b>: a array of instances of all created Modules
- 	 <b>oldConfig</b>: only set if this event is triggered during a reload of the config.

the init-Method may be called more than once, if the Config-file has changed and was reloaded. In this there the oldConfig will set.


### Events from the eth-Module

#### "watchContract"-Event

This Event will be triggered if the eth-Module starts watching for the open/close-Event from the contract. This event will be triggered for each contract.

The object passed as argument will give you the following properties:

- 	 <b>config</b> : the Configuration of the contractr as read from config. config.adr will hold the contract-adress.
-	   <b>id</b> : the id (or key within the config)


#### "changeState"-Event

This Event will be triggered if a contract tells the device, that it needs to change its state. 

The object passed as argument will give you the following properties:

- 	 <b>open</b> : a boolean true|false to indicate the targetState
-	   <b>id</b> : the id (or key within the config) of the device
- 	 <b>config</b> : the Configuration of the contract as read from config. config.adr will hold the contract-adress.

### Events from the websocket-Module

#### "message" - Event

Whenever a Message is received for one of the contract being watched. This event will be triggered.

The Object passed as argument will give you the following properties:

- 	 <b>from</b> : the adress of sender
-	   <b>to</b> : the adress of the receiver
- 	 <b>msg</b> : the text or message

### Events from the admin-Module


#### "adminMsg" - Event

sending a adminMsg-Event will cause the receiver to deliver the message to the admin.

The Object passed as argument will give you the following properties:
- 	 <b>msg</b> : the message to be delivered
-	 <b>cmd</b> : the command-object (optional)

#### "adminCmd" - Event

sending a adminCmd-Event will cause the admin-Module (if loaded) to execute this cmd.

The Object passed as argument will give you the following properties:

- 	 <b>name</b> : the command to execute
-	 <b>params</b> : the parameters to use as Array

#### "adminAddCmd" - Event

sending a adminCmd-Event will cause the admin-Module (if loaded) to add another command

The Object passed as argument will give you the following properties:

- 	 <b>name</b> : the command name
-	 <b>fnc</b> : a function to be executed
-	 <b>comment</b> : a comment to be shown if help is called




