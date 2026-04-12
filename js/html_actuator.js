function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");
  this.score = 0;
}

function xlcThousands(n){
  var b=parseInt(n).toString();
  var len=b.length;
  if(len<=3){return b;}
  var r=len%3;
  return r>0?b.slice(0,r)+","+b.slice(r,len).match(/\d{3}/g).join(","):b.slice(r,len).match(/\d{3}/g).join(",");
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);
    var maxscore = 0;
	var name = [
    "尼可", "茂八", "罗斯", "吉克", 
    "佐助", "狼刃", "尼禄", "鲍里斯", 
    "杰诺", "神", "龙", "夏目", 
    "莉莉娅", "莱纳斯","沃杰", 
    "图班"];
	var total_sum = 0;
	var total_sum_finals = 0;
    for(i in grid.cells){
      for(j in grid.cells[i]){
        if(grid.cells[i][j]){
		total_sum += grid.cells[i][j].value;
          maxscore = maxscore > grid.cells[i][j].value ? maxscore : grid.cells[i][j].value;
		  var currentMax = document.getElementsByTagName("span")[1], 
				 Diffculty = document.getElementsByTagName("span")[3];
         document.getElementsByTagName("span")[2].innerHTML = maxscore;
		 
				 Diffculty.className = "Mode";
		  currentMax.classList.add("currentMax");
		  if (Math.log2(maxscore) % 1 === 0 && Math.log2(maxscore) <= 16){
				  currentMax.textContent = name[Math.log2(maxscore) - 1];
		  }
		  else{
			  currentMax.textContent = maxscore;
		  }
		  
		  document.getElementsByTagName("span")[9].innerHTML = total_sum;
		   if(grid.cells[i][j].value >= 1024){
				total_sum_finals += grid.cells[i][j].value;
		   }
		   if (total_sum_finals  - maxscore > 0){ 
				document.getElementsByTagName("span")[10].innerHTML = Math.floor((total_sum_finals  - maxscore) / 1024);
		   } else {
			   document.getElementsByTagName("span")[10].innerHTML = Math.floor(-(total_sum_finals  - maxscore) / 1024);
		   }
		   
		 document.getElementsByTagName("span")[11].innerHTML = Math.floor(maxscore / 1024);
		  
		  if (maxscore < 2048){
			  Diffculty.classList.remove(Diffculty.className);
			  Diffculty.className = "Easy_Mode";
			  Diffculty.classList.add(Diffculty.className);
			  Diffculty.textContent = "EASY";
		  }
		  else if (maxscore >= 2048 && maxscore < 4096){
			  Diffculty.classList.remove(Diffculty.className);
			  Diffculty.className = "Normal_Mode";
			  Diffculty.classList.add(Diffculty.className);
			  Diffculty.textContent = "NORMAL";
		  }
		  else if (maxscore >= 4096 && maxscore < 8192){
			  Diffculty.classList.remove(Diffculty.className);
			  Diffculty.className = "Hard_Mode";
			  Diffculty.classList.add(Diffculty.className);
		  			  Diffculty.textContent = "HARD";
		  }
		  else if (maxscore >= 8192 && maxscore < 16384){
			  Diffculty.classList.remove(Diffculty.className);
			  Diffculty.className = "Lunatic_Mode";
			  Diffculty.classList.add(Diffculty.className);
		  			  Diffculty.textContent = "LUNATIC";
		  }
		  else if (maxscore >= 16384 && maxscore < 32768){
			  Diffculty.classList.remove(Diffculty.className);
			  Diffculty.className = "OverDrive_Mode";
			  Diffculty.classList.add(Diffculty.className);
		  	  Diffculty.textContent = "OVERDRIVE";
		  }
		  else if (maxscore >= 32768 && maxscore < 65536){
			  Diffculty.classList.remove(Diffculty.className);
			  Diffculty.className = "OverDrive_Mode";
			  Diffculty.classList.add(Diffculty.className);
		  	  Diffculty.textContent = "OVERDRIVE+";
		  }
		  else if (maxscore >= 65536){
			  Diffculty.classList.remove(Diffculty.className);
			  Diffculty.className = "OverDrive_Mode";
			  Diffculty.classList.add(Diffculty.className);
		  	  Diffculty.textContent = "OVERDRIVE++";
		  }
        }
      }
    }
	total_sum = 0;
	total_sum_finals = 0;

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false, maxscore); // You lose
	
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }
  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }

  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {

  var self = this;
  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 65536) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.innerHTML = tile.value;
  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = xlcThousands(this.score);

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + xlcThousands(difference);

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = xlcThousands(bestScore);
};

HTMLActuator.prototype.message = function (won, maxScore) {

  var type    = won ? "game-won" : "game-over";
  var message = won ? "2048 Clear!" : "满身疮痍。。。";

  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
  this.messageContainer.getElementsByTagName("span")[0].textContent = xlcThousands(this.score);
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

