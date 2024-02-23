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
    "茂八", "吉克", "龙哥", "老班", 
    "杰诺", "大龙哥", "狼刃", "胖哥", 
    "鲍里斯", "猴哥", "佐助", "平哥", 
    "沃杰", "小龙哥","图班", 
    "大源哥", "子纵", "峻玮", "鹏哥",
    "禄哥", "涛哥", "雨森", "灵梦",
    "泽哥", "魔理沙", "俊哥", "铭哥",
    "权哥", "大飞哥","三花"];
    for(i in grid.cells){
      for(j in grid.cells[i]){
        if(grid.cells[i][j]){
          maxscore = maxscore > grid.cells[i][j].value ? maxscore : grid.cells[i][j].value;
		  var currentMax = document.getElementsByTagName("span")[1], 
				 Diffculty = document.getElementsByTagName("span")[3];
         document.getElementsByTagName("span")[2].innerHTML = maxscore;
				 Diffculty.className = "Mode";
		  currentMax.classList.add("currentMax");
		  if (Math.log2(maxscore) % 1 === 0 && Math.log2(maxscore) <= 15){
			  if (window.group == "Group1"){
				  currentMax.textContent = name[Math.log2(maxscore) - 1];
			  }
			if (window.group == "Group2"){
				currentMax.textContent = name[14 + Math.log2(maxscore)];
			}
		  }
		  else{
			  currentMax.textContent = maxscore;
		  }
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
		  else if (maxscore >= 16384){
			  Diffculty.classList.remove(Diffculty.className);
			  Diffculty.className = "OverDrive_Mode";
			  Diffculty.classList.add(Diffculty.className);
		  	  Diffculty.textContent = "OVERDRIVE";
		  }
        }
      }
    }

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

  if (tile.value > 16384) classes.push("tile-super");

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
  var message = won ? "Normal Legacy Clear!" : "满身疮痍。。。";

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

