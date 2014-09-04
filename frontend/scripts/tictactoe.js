// JavaScript Document

function TicTacToe(){
	
	var self = this;
	
	var socket;
	
	var pairId;
	var id;
	
	//3 game modes: single, double, internet
	this.gameMode;
	this.gameType;
	
	this.pieceOffset;
	this.canvasWidth;
	this.canvasHeight;
	this.hoverSquareSide;
	this.imagePositionSide;
	
	//needed for AI
	this.unoccupiedPositions = [];
	
	this.restartButton;
	
	this.messages;
	
	this.currentPlayer = "X";
	
	this.numberOfTiles;
	
	/*
	model holds following values:
		objects with val attribute
			val: string -> "empty" "hoverX" "hoverO" "X" "O"
	*/
	this.model = [];
	this.winStreak;
	
	var assetLoaderCount = 0;
	
	//TODO: refactor this shit
	var assetLoader = function(){
		assetLoaderCount++;
		
		if(assetLoaderCount == 6){						
			self.reDraw();
		}
	}
	
	var displayInfoBucket = {
								imageBackground3x3: "images/template_background.png",
								imageHoverX3x3: "images/X_hover.png",
								imageHoverO3x3: "images/O_hover.png",
								imageX3x3: "images/X.png",
								imageO3x3: "images/O.png",
								imageWinLine3x3: "images/win_line.png",
								imageBackground5x5: "images/5x5_template_background.jpg",
								imageHoverX5x5: "images/5x5_X_hover.png",
								imageHoverO5x5: "images/5x5_O_hover.png",
								imageX5x5: "images/5x5_X.png",
								imageO5x5: "images/5x5_O.png",
								imageWinLine5x5: "images/5x5_win_line.png",
								pieceOffset3x3:45,
								canvasWidth3x3:687,
								canvasHeight3x3:687,
								hoverSquareSide3x3:230,
								imagePositionSide3x3:220,
								pieceOffset5x5:0,
								canvasWidth5x5:505,
								canvasHeight5x5:505,
								hoverSquareSide5x5:50,
								imagePositionSide5x5:50,
							};
	
	var imageBackground = new Image();
	imageBackground.onload = assetLoader;	

	var imageHoverX = new Image();
	imageHoverX.onload = assetLoader;	
	
	var imageHoverO = new Image();
	imageHoverO.onload = assetLoader;	
	
	var imageX = new Image();
	imageX.onload = assetLoader;	
	
	var imageO = new Image();
	imageO.onload = assetLoader;	
	
	var imageWinLine = new Image();
	imageWinLine.onload = assetLoader;	
	
	//create dom elements and add them to the dom
	this.initialize = function(container, gameMode, meId, opponentId, gameType){
		var self = this;
		
		//TODO refactor this shit
		if(gameType == "3x3"){
			this.gameType = "3x3";
			imageBackground.src = displayInfoBucket.imageBackground3x3;
			imageHoverX.src = displayInfoBucket.imageHoverX3x3;
			imageHoverO.src = displayInfoBucket.imageHoverO3x3;
			imageX.src = displayInfoBucket.imageX3x3;
			imageO.src = displayInfoBucket.imageO3x3;
			imageWinLine.src = displayInfoBucket.imageWinLine3x3;
			this.pieceOffset = displayInfoBucket.pieceOffset3x3;
			this.canvasWidth = this.canvasHeight = displayInfoBucket.canvasHeight3x3;
			this.hoverSquareSide = displayInfoBucket.hoverSquareSide3x3;
			this.imagePositionSide = displayInfoBucket.imagePositionSide3x3;
			
			this.numberOfTiles = 3;
			this.winStreak = 3;				
		}else{
			this.gameType = "5x5";
			imageBackground.src = displayInfoBucket.imageBackground5x5;
			imageHoverX.src = displayInfoBucket.imageHoverX5x5;
			imageHoverO.src = displayInfoBucket.imageHoverO5x5;
			imageX.src = displayInfoBucket.imageX5x5;
			imageO.src = displayInfoBucket.imageO5x5;
			imageWinLine.src = displayInfoBucket.imageWinLine5x5;
			this.pieceOffset = displayInfoBucket.pieceOffset5x5;
			this.canvasWidth = this.canvasHeight = displayInfoBucket.canvasHeight5x5;
			this.hoverSquareSide = displayInfoBucket.hoverSquareSide5x5;
			this.imagePositionSide = displayInfoBucket.imagePositionSide5x5;
			
			this.numberOfTiles = 10;
			this.winStreak = 5;
		}
		
		this.resetModel();
		
		var innerContainer = document.createElement("div");
		innerContainer.id = 'ticTacToe';
		innerContainer.style.width = (this.canvasWidth + 213)+"px";
		innerContainer.style.height = this.canvasHeight+"px";	
		
		this.gameMode = gameMode;
		
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("style","float:left");
		this.canvas.width = this.canvasWidth;
		this.canvas.height = this.canvasHeight;
		innerContainer.appendChild(this.canvas);
		
		innerContainer.appendChild(this.initializeRightContainer());
		
		container.appendChild(innerContainer);
						
		if(this.gameMode == "internet"){
			self.initializeInternetGame(meId, opponentId);
		}
		else
		{			
			self.addListeners();			
		}
	}
	
	this.initializeRightContainer = function(){
		var rightContainer = document.createElement("div");
		rightContainer.id = 'rightContainer';
		rightContainer.setAttribute("style","height:100%");
		
		this.restartButton = document.createElement("input");
		this.restartButton.type = 'button';
		this.restartButton.id = 'restartButton';
		this.restartButton.value = 'Restart';
		this.restartButton.setAttribute("style","float:left");
		this.restartButton.disabled = true;
		this.restartButton.addEventListener("click", this.restartHandler);
		
		this.findOtherButton = document.createElement("input");
		this.findOtherButton.type = 'button';
		this.findOtherButton.id = 'findOtherButton';
		this.findOtherButton.value = 'Find opponent';
		this.findOtherButton.setAttribute("style","float:left");
		this.findOtherButton.disabled = true;
		this.findOtherButton.addEventListener("click", this.findOtherHandler);
		
		this.sendMessageButton = document.createElement("input");
		this.sendMessageButton.type = 'button';
		this.sendMessageButton.id = 'sendMessageButton';
		this.sendMessageButton.value = 'Send';
		this.sendMessageButton.setAttribute("style","float:left");
		this.sendMessageButton.disabled = true;
		this.sendMessageButton.addEventListener("click", this.sendMessageHandler);
		
		this.sendMessageInput = document.createElement("input");
		this.sendMessageInput.id = 'sendMessageInput';
		this.sendMessageInput.setAttribute("style","float:left;");
		this.sendMessageInput.setAttribute("readonly","true");
		this.sendMessageInput.addEventListener("keypress", this.inputChangeHandler);
				
		this.messages = document.createElement("textarea");
		this.messages.setAttribute("style","float:left; resize:none; height:80%;");
		this.messages.setAttribute("readonly","true");
		
		rightContainer.appendChild(this.restartButton);
		
		if(this.gameMode == "internet"){
			rightContainer.appendChild(this.findOtherButton);
			rightContainer.appendChild(this.messages);
			rightContainer.appendChild(this.sendMessageInput);
			rightContainer.appendChild(this.sendMessageButton);
		}
		
		return rightContainer;
	}
	
	this.initializeInternetGame = function(meId, opponentId){
			socket = new WebSocket("ws://razvanarenasumare.no-ip.biz:1338", "echo-protocol");
			//socket = new WebSocket("ws://localhost:1338", "echo-protocol");
			
			socket.addEventListener("open", function(event) {
			  self.appendMessage("Connected.");
			  self.appendMessage("\nWaiting for opponent.");
			  var sendData = {"type":"setup",
			  					"id": meId,
								"opponent": opponentId,
								"gameType": self.gameType
			  				};
			  
			  //alert(JSON.stringify(sendData));
			  socket.send(JSON.stringify(sendData));
			});
	
			// Display messages received from the server
			socket.addEventListener("message", function(event) {
			  //self.messages.value += "\nServer Says: " + event.data;
			  
			  var comm;
			  
			  try
			  {
				  com = JSON.parse(event.data);
				  
				  switch(com.type) {
					  
					case "pair-setup":
						pairId = com.message.pairId;
						id = com.message.id;
						self.currentPlayer = com.message.currentPlayer;
						self.appendMessage("\nopponent connected.");
						self.appendMessage("\nYou are playing as "+self.currentPlayer);
						
						if(com.message.firstPlayer){
							self.appendMessage("\nYou are the first to start.");
							
							self.addListeners();
						}
						else
						{
							self.appendMessage("\nYour opponent is the first to start.");
						}
						
						self.sendMessageInput.removeAttribute("readonly");
						self.sendMessageButton.disabled = false;
						
						break;
						
					case "pair-message":
						if(com.message.id != id){
							self.model = com.message.model;
							self.unoccupiedPositions = [];
							for(var i = 0 ; i < self.model.length ; i ++){
								for(var j = 0 ; j < self.model[i].length ; j++){
									if(self.model[i][j].val == "empty")self.unoccupiedPositions[j+'.'+i] = self.model[i][j];
								}
							}
							self.reDraw();
							if(com.message.changePlayer){
								
								var w = self.checkForWinner();
								if(!w){
									self.addListeners();
								}
							}								
						}
						break;
						
					case "communication-message":
						self.appendMessage("\n" + decodeURIComponent(com.message));
						break;
						
					case "restart-request":
						self.appendMessage("\nYour opponent wants a rematch.");
						break;
						
					case "restart-setup":
						self.resetModel();
						
						self.reDraw();
					
						if(com.message.firstPlayer){
							self.appendMessage("\nYou are the first to start.");
							
							self.addListeners();
						}
						else
						{
							self.appendMessage("\nYour opponent is the first to start.");
						}
						break;
						
					case "player-disconected":
					
						self.findOtherButton.disabled = false;
						self.restartButton.disabled = true;
					
						self.appendMessage("\nYour opponent has left the game.");
							
						self.removeListeners();
						
						self.sendMessageInput.setAttribute("readonly","true");
						self.sendMessageButton.disabled = true;
					
						break;
					  
				  }
			  }
			  catch(ex)
			  {
				  self.appendMessage("\nComm err.");
			  }
			  
			});
	
			// Display any errors that occur
			socket.addEventListener("error", function(event) {
			  self.appendMessage("\nError: " + event);
			});
	
			socket.addEventListener("close", function(event) {
			  self.appendMessage("\nNot Connected");
			});
	}
	
	this.resetModel = function(){
		self.model = [];
		for(var i = 0 ; i < self.numberOfTiles ; i++){
						var tempi = []
						for(var j = 0 ; j < self.numberOfTiles ; j++){
							tempi.push({'val':"empty"});
						}
						self.model.push(tempi);
					}

		self.unoccupiedPositions = [];
					
		for(var i = 0 ; i < self.model.length ; i ++){
			for(var j = 0 ; j < self.model[i].length ; j++){
				self.unoccupiedPositions[j+'.'+i] = self.model[i][j];
			}
		}
	}
	
	this.appendMessage = function(message){
		self.messages.value += message;
		self.messages.scrollTop = self.messages.scrollHeight;
	}
	
	this.inputChangeHandler = function(e){
		if(e.which == 13){
			e.preventDefault();
			e.stopPropagation();
			self.sendMessageHandler();
		}
	}
	
	this.sendMessageHandler = function(){
		var com = {
							type:"communication-message",
							message:encodeURIComponent(self.currentPlayer + ": " +self.sendMessageInput.value),
							pairId:pairId,
						};
				socket.send(JSON.stringify(com));
				self.sendMessageInput.value = "";
	}
	
	this.addListeners = function(){
		self.canvas.addEventListener("mousemove", self.mouseMoveHandler);
		self.canvas.addEventListener("click", self.clickHandler);
		self.canvas.addEventListener("mouseout", self.mouseOutHandler);	
	}
	
	this.removeListeners = function(){
		self.canvas.removeEventListener("mousemove", self.mouseMoveHandler);
		self.canvas.removeEventListener("click", self.clickHandler);
		self.canvas.removeEventListener("mouseout", self.mouseOutHandler);	
	}
	
	//convert mouse X and Y to check over which square the user is over
	this.mouseMoveHandler = function(e){
		
		var hoverModelX = Math.floor((e.clientX) / self.hoverSquareSide);
		var hoverModelY = Math.floor((e.clientY) / self.hoverSquareSide);
		
		if((self.model[hoverModelY]) && (self.model[hoverModelY][hoverModelX])){
			
			if(self.model[hoverModelY][hoverModelX].val == "empty"){//hovering over an empty space
				self.clearModelHover();
				self.model[hoverModelY][hoverModelX].val = "hover"+self.currentPlayer;
				self.sendModel();
			}else if(self.model[hoverModelY][hoverModelX].val != "hover"+self.currentPlayer){//hovering over an occupied space
				self.clearModelHover();
			}
			self.reDraw();
		}else {//hovering out of bounds
			self.clearModelHover();
			self.reDraw();
		}
	}
	
	this.sendModel = function(switchPlayer){
		if(self.gameMode == "internet")
			{
				var com = {
							type:"pair-message",
							pairId:pairId,
							message:{
									id:id,
									model:self.model,
									unoccupiedPositions:self.unoccupiedPositions,
									changePlayer:switchPlayer,
								},
							};
				socket.send(JSON.stringify(com));
			}
	}
	
	//if the square is empty, select it
	this.clickHandler = function(e){
		
		var hoverModelX = Math.floor((e.clientX) / self.hoverSquareSide);
		var hoverModelY = Math.floor((e.clientY) / self.hoverSquareSide);
		
		if((self.model[hoverModelY]) && 
			(self.model[hoverModelY][hoverModelX]) && 
			(self.model[hoverModelY][hoverModelX].val != "X") &&
			(self.model[hoverModelY][hoverModelX].val != "O")){
				self.model[hoverModelY][hoverModelX].val = self.currentPlayer;
				
				delete self.unoccupiedPositions[hoverModelX+'.'+hoverModelY];
				self.sendModel(true);
				
				self.checkForWinner();
			}
	}
	
	//clear hover when user leaves canvas
	this.mouseOutHandler = function(e){
		self.clearModelHover();
		self.sendModel();
		self.reDraw();
	}
	
	//change turn
	this.switchPlayer = function(){
		if(this.gameMode == 'single'){
			
			this.clearModelHover();
			this.reDraw();
			
			if(this.currentPlayer == "X"){
				this.currentPlayer = "O";
				this.removeListeners();
				
				var length = this.calculateLengthOfMap(this.unoccupiedPositions);			
				var randomGeneratedPosition = Math.floor(Math.random()*length);				
				this.generateAIMove(this.unoccupiedPositions,randomGeneratedPosition);
				
				this.checkForWinner();
			}
			else{
				this.currentPlayer = "X";
				this.addListeners();
			}			
		}else if(this.gameMode == 'double'){
			if(this.currentPlayer == "X"){
				this.currentPlayer = "O";
			}
			else{
				this.currentPlayer = "X";
			}
			this.clearModelHover();
			this.reDraw();
		}else if(this.gameMode == 'internet'){
			this.removeListeners();
			this.clearModelHover();
			this.reDraw();
		}
	}
	
	//on every click we have to check if the user has won
	this.checkForWinner = function(){
		
		var win = false;
		
		for(var i = 0 ; i < self.model.length ; i ++){
			for(var j = 0 ; j < self.model[i].length ; j++){				
				if(self.model[i][j].val != 'empty'){
					win = (self.checkDirection(i,j,"dreapta") || self.checkDirection(i,j,"jos")
							 || self.checkDirection(i,j,"diagonala-dreapta") || self.checkDirection(i,j,"diagonala-stanga"));
				}
				if(win){
					break;
				}
			}
			if(win){
				break;
			}
		}
		if(!win){
			if(self.calculateLengthOfMap(self.unoccupiedPositions) > 0){
				//if(self.gameMode != 'internet'){
					self.switchPlayer();
				//}				
			}else{
				self.reDraw();
				self.removeListeners();
				self.restartButton.disabled = false;
			}
		}
		else{
			self.reDraw();
			self.drawWinner({'i':i, 'j':j, 'angle':win});
			self.removeListeners();
			self.restartButton.disabled = false;
		}
		return win;	
	}
	
	//helper function to check for winner
	this.checkDirection = function(i, j, direction){
		var val = self.model[i][j].val;
		var ret = true;
		
		switch(direction){
			case "dreapta":
				if(self.model[i].length > j+(self.winStreak-1)){
					for(var x = 1 ; x < self.winStreak ; x++){
						if(self.model[i][j+x].val != val){
							ret = false;
							break;
						}
					}
				}else ret = false;				
			break;
			case "diagonala-dreapta":
				if((self.model[i].length > j+(self.winStreak-1)) && (self.model[i].length > i+(self.winStreak-1))){
					for(var x = 1 ; x < self.winStreak ; x++){
						if(self.model[i+x][j+x].val != val){
							ret = false;
							break;
						}
					}
				}else ret = false;
			break;
			case "jos":
				if(self.model[i].length > i+(self.winStreak-1)){
					for(var x = 1 ; x < self.winStreak ; x++){
						if(self.model[i+x][j].val != val){
							ret = false;
							break;
						}
					}
				}else ret = false;
			break;
			case "diagonala-stanga":
				if((0 <= j-(self.winStreak-1)) && (self.model.length > i+(self.winStreak-1))){
					for(var x = 1 ; x < self.winStreak ; x++){
						if(self.model[i+x][j-x].val != val){
							ret = false;
							break;
						}
					}
				}else ret = false;
			break;
		}
		
		if(ret){
			switch(direction){
				case "dreapta":
					return 360;
				break;
				case "diagonala-dreapta":
					return 45;
				break;
				case "jos":
					return 90;
				break;
				case "diagonala-stanga":
					return 135;
				break;
			}
		}else{
			return false;
		}
	}
	
	//helper function to check for winner
	this.clearModelHover = function(){
		for(var i = 0 ; i < self.model.length ; i ++){
			for(var j = 0 ; j < self.model[i].length ; j++){
				if(self.model[i][j].val.indexOf('hover') != -1){
					self.model[i][j].val = "empty";
				}
			}
		}
	}
	
	//redraw the canvas
	this.reDraw = function(){
		var context = this.canvas.getContext("2d");
		
		context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

		this.drawBoard();
		this.drawPieces();
	}
	
	//draw the background
	this.drawBoard = function(){
		var context = this.canvas.getContext("2d");
		context.drawImage(imageBackground, 0, 0);		
	}

	//draw the selected squares
	this.drawPieces = function() {
		var context = this.canvas.getContext("2d");
		
		for(var i = 0 ; i < self.model.length ; i ++){
			for(var j = 0 ; j < self.model[i].length ; j++){
				if(self.model[i][j].val == 'hoverO'){
					context.drawImage(imageHoverO, self.pieceOffset + j * self.imagePositionSide, self.pieceOffset + i * self.imagePositionSide);
				}
				if(self.model[i][j].val == 'hoverX'){
					context.drawImage(imageHoverX, self.pieceOffset + j * self.imagePositionSide, self.pieceOffset + i * self.imagePositionSide);
				}
				if(self.model[i][j].val == 'O'){
					context.drawImage(imageO, self.pieceOffset + j * self.imagePositionSide, self.pieceOffset + i * self.imagePositionSide);
				}
				if(self.model[i][j].val == 'X'){
					context.drawImage(imageX, self.pieceOffset + j * self.imagePositionSide, self.pieceOffset + i * self.imagePositionSide);
				}
			}
		}
	}
	
	//draw line over winning combination
	this.drawWinner = function(winner){
        var context = this.canvas.getContext("2d");
		context.save();
		context.translate(this.imagePositionSide/2 + winner.j * this.imagePositionSide , this.imagePositionSide/2 + winner.i * this.imagePositionSide);
        context.rotate(winner.angle * Math.PI/180);
		
		var clip = 0;
		
		if(winner.angle == 90 || winner.angle == 360){
			clip = 80;
		}
		
		context.drawImage(imageWinLine, 0, 0, imageWinLine.width - clip, imageWinLine.height);
		context.restore();
    }
	
	//returns the length of a key -> value map
	this.calculateLengthOfMap = function(map){
		var size = 0, key;
		for (key in map) {
			if (map.hasOwnProperty(key)) size++;
		}
		return size;
	}
	
	//randomly select a unselected square
	this.generateAIMove = function(map,index) {
		var size = 0, key;
		for (key in map) {
			if (map.hasOwnProperty(key) && size != index){
				size++;
			}else if(size == index){
				var ij = key.split('.');
				
				var i = ij[0];
				var j = ij[1];
				
				map[key].val = "O";
				
				delete map[key];
				break;
			}
		}
	}
	
	//restart the game
	this.restartHandler = function(){	
		if(self.gameMode == "internet"){
			socket.send('{"type":"restart"}');
			
			self.appendMessage("\nRestart request sent.");
			self.appendMessage("\nWaiting for opponent.");			
		}else{
			self.resetModel();
			self.currentPlayer = "X";
		
			self.addListeners();
			self.reDraw();
		}
		self.restartButton.disabled = true;
	}
	
	this.findOtherHandler = function(){
		var com = {
					type:"find-other-request"
					};
		socket.send(JSON.stringify(com));
		self.appendMessage("\nRestart request sent.");
		self.appendMessage("\nWaiting for opponent.");
		self.resetModel();
		self.reDraw();
		self.findOtherButton.disabled = true;
	}
	
	return {
		initialize: function() {
			self.initialize.apply(self, arguments);
		}
	}
}