/*
Radhika Mattoo, rm3485@nyu.edu
Applied Internet Tech Spring 2016
Homework 7
*/
document.addEventListener("DOMContentLoaded", start);

//stores score to calculate user score and display die values
var dieValues = [-1,-1,-1,-1, -1];
var pinnedCount = 0; //reset after every round
function start(){
    //hide game and error message
  document.getElementById("error-message").classList.add("hidden");
  document.getElementById("game").classList.add("hidden");

  //add event listener to start button to trigger game
	var start = document.getElementById("intro").firstChild.nextSibling;
  start.addEventListener('click', game);
}

function game(){
  //add all necessary HTML elements to game div

  //hide start button and show game div
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  //simulate computer's turn
  var compGame = computerScore();
  var compScore = compGame[0];
  var compString = compGame[1];

  //comp score element
  var compParagraph = document.createElement("p");
  compParagraph.setAttribute('id', 'computerScore');
  var compDisplay = document.createTextNode("Computer Score: " + compString + "\n");

  //user score element
  var playerParagraph = document.createElement("p");
  playerParagraph.setAttribute('id', 'playerScore');
  var scoreDisplay = document.createTextNode("Your Score: 0");

  compParagraph.appendChild(compDisplay);
  playerParagraph.appendChild(scoreDisplay);

  //append to game div
  var gameDiv = document.getElementById("game");
  gameDiv.appendChild(compParagraph);
  gameDiv.appendChild(playerParagraph);


  //make die div
  var die = document.createElement('div');
  die.setAttribute('id', 'die');
  for(var i = 0; i < 5; i++){
    var ele = document.createElement('p');
    var text = document.createTextNode(" ");
    ele.appendChild(text);
    ele.setAttribute('class', "die");
    ele.classList.add('class', "cleared");
    ele.setAttribute('id', i);
    die.appendChild(ele);
  }
  gameDiv.appendChild(die);

  //make buttons
  var rollButton = document.createElement('button');
  var rollText = document.createTextNode("Roll");
  rollButton.appendChild(rollText);
  rollButton.setAttribute('class', 'buttons');
  rollButton.classList.toggle('active');

  var pinButton = document.createElement('button');
  var pinText = document.createTextNode("Pin");
  pinButton.appendChild(pinText);
  pinButton.setAttribute('class', 'buttons');
  pinButton.setAttribute('disabled', 'disabled');

  //append to game div
  gameDiv.appendChild(rollButton);
  gameDiv.appendChild(pinButton);

  //set up error div
  var errorButton = document.querySelector('.closeButton');
  errorButton.addEventListener('click', function(){
    document.querySelector('#error-message').classList.add("hidden");
    document.body.classList.toggle("error");
    var modalDiv = document.querySelector('.modal');
    var paragraph = modalDiv.childNodes[1];
    paragraph.removeChild(paragraph.firstChild);
  });

  //DICE
  var dies = document.getElementsByClassName("die");
  for(var i = 0; i < dies.length; i++){
    (function () {
      //get die's value, classList, and id
      var die = dies[i];
      var value = die.firstChild.data;
      var classList = die.classList;
      var id = die.getAttribute('id');

      die.addEventListener('click', function(){
        if(!pinButton.disabled){
          die.classList.toggle('pinned');
          if(classList.contains('pinned')){
            pinnedCount++;
            dieValues[i] = value;
          }else{
            pinnedCount--;
            dieValues[i] = -1;
          }
        }else{ //error message

          //CSS
          document.body.classList.toggle("error");
          document.querySelector('#error-message').classList.remove("hidden");

          //get error-message div and write error
          var modalDiv = document.querySelector('.modal');
          var paragraph = modalDiv.childNodes[1];
          if(paragraph.childNodes.length === 0){
            paragraph.appendChild(document.createTextNode("You have to roll the die first!"));
          }
        }
      });
    }()); // immediate invocation
  }

  //ROLL
  rollButton.addEventListener('click', function(){
      roll();
      //display
      for(var i = 0; i < dies.length; i++){
        var dieDOM = dies[i];
        var textNode = dieDOM.firstChild;
        textNode.data = dieValues[i];
        if(dieDOM.classList.contains("cleared")){
          dieDOM.classList.remove("cleared");
        }
      }
      //now disable roll and enable pin
      rollButton.setAttribute('disabled', 'disabled');
      pinButton.removeAttribute('disabled');

      pinButton.classList.toggle('active');
      rollButton.classList.toggle('active');
  });


  //PIN
  pinButton.addEventListener('click', function(){
    //error handling
    if(pinnedCount < 1){
      //CSS
      document.body.classList.toggle("error");
      document.querySelector('#error-message').classList.remove("hidden");

      //get error-message div and create message
      var modalDiv = document.querySelector('.modal');
      var paragraph = modalDiv.childNodes[1];
      if(paragraph.childNodes.length === 0){
        paragraph.appendChild(document.createTextNode("You have to pin a die first!"));
      }
    }else{

      //either pin or clear die
      for(var i = 0; i < dies.length; i++){
        var die = dies[i];
        //disable all selected die
        if(die.classList.contains('pinned')){
            die.setAttribute('disabled', 'disabled');
            die.classList.add('saved');
        }else{//clear all other die
          var textNode = die.firstChild;
          textNode.data = "\n";
          die.classList.toggle("cleared");
          dieValues[i] = -1;
        }
      }

      //calculate and display user score
      var scoreArray = calculateScore();
      var score = scoreArray[0];
      var scoreString = scoreArray[1];
      var scoreNode = document.getElementById("playerScore").firstChild;
      scoreNode.data = scoreString;

      //check if the game's over
      if(dieValues.indexOf(-1) === -1){ //done with game
        //disable all pins, figure out result
        pinButton.setAttribute('disabled', 'disabled');
        pinButton.classList.toggle('active');
        var resultNode = document.createElement('p');
        var result = findWinner(score, compScore);

        //find proper string result and add class for CSS
        if(result === "win"){
          result = "You won!";
          resultNode.classList.add('win');
        }else if (result === "lose"){
          result = "You lost!";
          resultNode.classList.add('lose');
        }else{
          result = "Tie!";
          resultNode.classList.add('tie');
        }

        //add textnode to playerscore paragraph
        var subtext = document.createTextNode(result);
        resultNode.appendChild(subtext);
        playerParagraph.appendChild(resultNode);

      }else{
        pinnedCount = 0;
        ///now disable pin  and enable roll
        pinButton.setAttribute('disabled', 'disabled');
        rollButton.removeAttribute('disabled');

        pinButton.classList.toggle('active');
        rollButton.classList.toggle('active');
      }
    }
  });


}


/*Simulates the game for the computer and returns an array w/ the score and its toString */
function computerScore(){
  var score = 0;
  var scoreString = "";
  for(var die = 5; die > 0; die--){
    var values = [];
    for(var i = 0; i < die; i++){
      values[i] = Math.floor((Math.random() * 6) + 1);
    }
    var min = Math.min.apply(Math, values);
    if(min === 3){
      scoreString += " 0 (3) +";
    }else{
      score += min;
      scoreString += " " + min + " +";
    }

  }

  scoreString = scoreString.slice(0, -1);
  scoreString += " = " + score;

  return [score, scoreString];

}

/*Simulates a die roll based on global die array, dieValues */
function roll(){
  for(var i = 0; i < dieValues.length; i++){
    if(dieValues[i] !== -1){continue;}
    var value = Math.floor((Math.random() * 6) + 1);
    dieValues[i] = value;
  }
}
/*Calculates winner based on scores, returns a string 'tie', 'win', 'lose' */
function findWinner(player, computer){
  if(player < computer) return "win";
  else if (computer < player) return "lose";
  else return "tie";

}
/*Calculates user score based on global dieValues array */
function calculateScore(){
  var score = 0;
  var scoreString = "Your Score:";
  var count = 0;

  for(var i = 0; i < 5; i++){
    //calculate and display user score
    if(dieValues[i] === 3){
      count++;
      score += 0;
      scoreString += " 0 (3) +";
    }
    else if(dieValues[i] !== -1){
      count++;
      score += dieValues[i];
      scoreString += " " + dieValues[i] + " +";
    }
  }
  if(count === 1){
    scoreString = "Your Score: " + score;
  }else{
    scoreString = scoreString.slice(0, -1);
    scoreString += " = " + score;
  }

  return [score, scoreString];
}
