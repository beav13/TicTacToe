#!/usr/bin/env node

var connectionPool = [];
var quePool = {"3x3":[],
				"5x5":[]};
var requestedOpponentPool = [];
var pairPool = [];

var calculateLengthOfMap = function(map) {
	var size = 0, key;
	for (key in map) {
		if (map.hasOwnProperty(key)) size++;
	}
	return size;
};

var Pair = function(players, designatedOpponents){
	
	var self = this;
	
	this.id = Math.floor(Math.random()*1000000);
	
	console.log(' new pair created between: '+players[0].id + ' ' + players[1].id);
	
	this.playerOne = players[0];
	this.playerTwo = players[1];
	
	this.playerOne.pairId = this.id;
	this.playerTwo.pairId = this.id;
	
	var p1pairId = {
					type:'pair-setup',
					message:{id:players[0].id,
								pairId:this.id,
								currentPlayer:"X",
								firstPlayer:true
							}
					};
					
	var p2pairId = {
					type:'pair-setup',
					message:{id:players[1].id,
								pairId:this.id,
								currentPlayer:"O",
								firstPlayer:false
							}
					};
						
	this.playerOne.sendUTF(JSON.stringify(p1pairId));
	this.playerTwo.sendUTF(JSON.stringify(p2pairId));
	
	if(designatedOpponents){
		delete requestedOpponentPool[this.playerOne.id];
		delete requestedOpponentPool[this.playerTwo.id];
	}else{
		delete quePool[this.playerOne.gameType][this.playerOne.id];
		delete quePool[this.playerTwo.gameType][this.playerTwo.id];
	}
	
	this.sendMessage = function(message){
		self.playerOne.sendUTF(JSON.stringify(message));
		self.playerTwo.sendUTF(JSON.stringify(message));
		
		//console.log('send message: '+JSON.stringify(message));
	}
	
	this.checkForRestart = function(){
		
		if(self.playerOne.restartReq && self.playerTwo.restartReq){
			
			self.playerOne.restartReq = false;
			self.playerTwo.restartReq = false;
			
			var p1setup = {
					type:'restart-setup',
					message:{
								firstPlayer:true
							}
					};
					
			var p2setup = {
							type:'restart-setup',
							message:{
										firstPlayer:false
									}
							};
								
			this.playerOne.sendUTF(JSON.stringify(p1setup));
			this.playerTwo.sendUTF(JSON.stringify(p2setup));
			
		}else{
			if(self.playerOne.restartReq){
				self.playerTwo.sendUTF(JSON.stringify({type:"restart-request"}));
			}else{
				self.playerOne.sendUTF(JSON.stringify({type:"restart-request"}));
			}
		}
		
	}
	
	this.removePair = function(){
		
		var message = {
				"type":"player-disconected"
			}
		
		if(!self.playerOne.disabled){
			self.playerOne.sendUTF(JSON.stringify(message));
			console.log('am scos: player one '+self.playerOne.id+' dintrun pair');			
		}else if(!self.playerTwo.disabled){
			self.playerTwo.sendUTF(JSON.stringify(message));			
			console.log('am scos: player two '+self.playerTwo.id+' dintrun pair');
		}
		
		self.playerOne.pairId = undefined;
		self.playerTwo.pairId = undefined;
		
		delete pairPool[self.id];
	}
}

var pairPlayers = function(gameType) {
	
	console.log("pair players");
	
	if(calculateLengthOfMap(quePool[gameType]) >= 2){
		var size = 0, key;
	
		var players = [];
		
		for (key in quePool[gameType]) {
			if (quePool[gameType].hasOwnProperty(key) && size < 2){
				size++;			
				players.push(quePool[gameType][key]);			
			}
			else{
				break;
			}
		}
		
		var pair = new Pair(players);
		
		pairPool[pair.id] = pair;
	}	
};

var pairOpponents = function(idOne, idTwo) {
	
	console.log("pair opponents");
	
	if(requestedOpponentPool[idOne] && requestedOpponentPool[idTwo]){
		var players = [];
		players.push(requestedOpponentPool[idOne]);
		players.push(requestedOpponentPool[idTwo]);
		
		var pair = new Pair(players, true);
		
		pairPool[pair.id] = pair;
	}
	
};

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(1338, function() {
    console.log((new Date()) + ' Server is listening on port 1337');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
	
    console.log((new Date()) + ' Connection accepted. origin: '+ request.url+' connection remote address: '+ connection.remoteAddress );
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
			
			var msg = JSON.parse(message.utf8Data);
			
			switch(msg.type) {
					case "setup":
					
						console.log('received setup ');
						
						console.log(message.utf8Data);
					
						if(msg.id){
							connection.id = msg.id;
							connection.waitingFor = msg.opponent;
							
							connectionPool[connection.id] = connection;
						
							requestedOpponentPool[connection.id] = connection;
							
							pairOpponents(msg.id, msg.opponent);
							
						}else{
							connection.id = Math.floor(Math.random()*1000000);
							connection.gameType = msg.gameType;
							connectionPool[connection.id] = connection;
						
							quePool[connection.gameType][connection.id] = connection;
							
							if(calculateLengthOfMap(quePool[connection.gameType]) >= 2){
								pairPlayers(connection.gameType);
							}
						}
						
					break;
						
					case "pair-message":
					
						if(pairPool[msg.pairId]){
							
							var response = {
								type:'pair-message',
								message:msg.message
							};
							
							pairPool[msg.pairId].sendMessage(response);
						}
						
					break;
					
					case "restart":					
						connection.restartReq = true;
						pairPool[connection.pairId].checkForRestart();	
					break;
					
					case "find-other-request":
						quePool[connection.gameType][connection.id] = connection;
						
						if(calculateLengthOfMap(quePool[connection.gameType]) >= 2){
							pairPlayers(connection.gameType);
						}
					break;
					
					case "communication-message":
						if(pairPool[msg.pairId]){
							
							var response = {
								type:'communication-message',
								message:msg.message
							};
							
							pairPool[msg.pairId].sendMessage(response);
						}
					break;
				  }	
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
		
		connection.disabled = true;
		if(connection.pairId){
			pairPool[connection.pairId].removePair();
		}
		delete connectionPool[connection.id];
		if(quePool[connection.gameType][connection.id]){
			delete quePool[connection.gameType][connection.id];
		}		
		delete requestedOpponentPool[connection.id];
    });
});