let player = {
  name: "Player",
  chips: 250,
  sayHello: function () {
    alert("Hello there!");
  },
};
let deckId;
let newDeck = document.getElementById("new-deck");
let dealCard = document.getElementById("draw-card");
let chipAmount = document.getElementById("chip-amount");
let dealerCards = document.getElementById("dealer-cards");
let dealerCardsArray = [];
let playerCards = document.getElementById("player-cards");
let playerCardsArray = [];
let playerName = document.getElementById("player-name");
let playerSumEl = document.getElementById("player-sum");
let playerMessage = document.getElementById("player-message");
let stayBtn = document.getElementById("stay-btn");
let okBtn = document.getElementById("ok-btn");
let dealerSumEl = document.getElementById("dealer-sum");
let modal = document.getElementById("modal");
let confirmBtn = document.getElementById("confirm");
let newGameBtn = document.getElementById("nav-btn");
let overlay = document.getElementById("overlay");

let winsInARow = 0;
let playerSum = 0;
let dealerSum = 0;
let hasBlackJack = false;
let isAlive = false;
let message = "";
let winner = "";
let roundStart;



// Brings up overlay with a message and on the button click starts a new game
function gameOver() {
  overlay.style.display = "flex";
  modal.innerHTML = `<h2>You are out of chips. Game Over..</h2><br><button class="btn"\
   onclick="startNewGame()">NEW GAME</button>`;
}

// Changes the chip amount and checks if player is out of chips or not
function updateChips() {
  chipAmount.textContent = `$${player.chips}`;
  if (player.chips <= 0) {
    gameOver();
  }
}

// Makes an API call to get a unique deckID from deckofcardsapi.com and assigns it to
// a global variable "deckID" and calls "dealStartingCards()"
function getDeckId() {
  fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then((res) => res.json())
    .then((data) => {
      deckId = data.deck_id;
      console.log(`data.deck_id: ${data.deck_id}`);
    })
    .then(dealStartingCards);
}

// Reshuffles deck using current unique ID
function reshuffleCards() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);
}

// Draws 4 cards from deck and checks remaining cards to see if we need a reshuffle. Threshold
// is less than 6 remaining.
function dealStartingCards() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`)
    .then((res) => res.json())
    .then((data) => {
      if (data.remaining < 6) {
        reshuffleCards();
      }
      // Two cards each are added to the player and dealer arrays and the main logic "renderGame()" is
      // called
      dealerCardsArray.push(data.cards[0], data.cards[1]);
      playerCardsArray.push(data.cards[2], data.cards[3]);
      renderGame(playerCardsArray, dealerCardsArray);
    });
}

// Adds a single card to the player array and calls "renderGame()"
function dealSingleCard() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
    .then((res) => res.json())
    .then((data) => {
      playerCardsArray.push(data.cards[0]);
      renderGame(playerCardsArray, dealerCardsArray);
    });
}

function getFinishedTime(){
  let seconds = 0;
  let minutes = 0;
  let time = (Date.now() - roundStart) / 1000 
  if (time > 60){
    minutes = time / 60;
    seconds = time % 60;
    return `${Math.floor(minutes)}:${seconds < 10 ? "0" + seconds.toFixed(2) : seconds.toFixed(2)} minutes`
  } else {
    return `${time} seconds`
  }

}

// Gets a new deck, resets player chips, renders the table and cards
function startGame() {
  getDeckId();  
  roundStart = Date.now()
  player.chips = 250;
  winsInARow = 0;
  document.getElementById("main").style.display = "grid";
  renderGame(playerCardsArray, dealerCardsArray);
}

function checkAces(arr) {
  let aceCount = 0;
  for (item of arr) {
    if (item === "ACE") {
      aceCount++;
    }
  }
  return aceCount;
}

function checkSuits(value) {
  let cardValue;
  if (value === "KING" || value === "JACK" || value === "QUEEN") {
    cardValue = 10;
  } else {
    cardValue = value;
  }
  return cardValue;
}



// Takes the value from the API response and converts it to a number. So the tricky part
// is the Ace, which can be different values depending on the rest of the cards in the
// hand. This has created some bugs in the gameplay logic, which I am revising..
function convertValue(value, arr) {
  let otherCards = arr
    .filter((item) => item != "ACE")
    .map((item) => checkSuits(item));
  let cardValue = 0;
  if (value === "KING" || value === "JACK" || value === "QUEEN") {
    cardValue = 10;
  } else if (value === "ACE") {
    if (checkAces(arr) <= 1 && otherCards.reduce((a, b) => a + b, 0) < 11) {
      cardValue = 11;
    } else {
      cardValue = 1;
    }
  } else {
    cardValue = parseInt(value);
  }
  return cardValue;
}

// Takes all the cards in the PLAYER array and returns a sum of all the values.
// This can be refactored with the DealerSum and may also be part of the Ace value
// problem in the game logic
function getPlayerSum() {
  let p1Sum = 0;
  let convertedPSum = playerCardsArray.map((item) => item.value);
  for (let item of convertedPSum) {
    p1Sum += convertValue(item, convertedPSum);
  }
  return p1Sum;
}

// Takes all the cards in the DEALER array and returns a sum of all the values.
function getDealerSum() {
  let dealerSum = 0;
  let convertedDSum = dealerCardsArray.map((item) => item.value);
  for (let item of convertedDSum) {
    dealerSum += convertValue(item, convertedDSum);
  }
  document.getElementById("dealer-sum").textContent = `Dealer: ${dealerSum}`;
  return dealerSum;
}

// This function clears the table and clears both arrays of current cards
function newHand() {
  playerCards.innerHTML = "";
  dealerCards.innerHTML = "";
  playerCardsArray = [];
  dealerCardsArray = [];
}

// Displays a modal message for a draw
function playerDraw() {
  modal.innerHTML = `<h2 id="modal-message">Draw!</h2><button onclick="confirmHandler()" class="btn" id="confirm">OK</button>`;
  document.getElementById("overlay").style.display = "flex";
}

function confirmGameOver(){
  roundStart = 0;
  confirmNewGame()  
}

function gameWon(){
  modal.innerHTML = `<h2 id="modal-message">Congratulations, you reached <span class="got-blackjack">$1000!</span></h2><h3>TOTAL TIME:</h3><h3 id="time"><span class="got-blackjack">${getFinishedTime()}</span></h3><button onclick="confirmGameOver()" class="btn" id="confirm">OK</button>`;
  document.getElementById("overlay").style.display = "flex";  
  console.log(`Goal reached, finished time: ${getFinishedTime()}`)
}

function randomCompliment(numOfWins) {
  let compliments;
  let bottomLevel = [
    "Yay!",
    "Great job!",
    "Way to go!",
    
  ]
  let middleLevel = [
    "Outstanding!!",
    "You are KILLING it!",
    "ANOTHER win!? You're heating up!",
    "You are in the ZONE!",
  ]
  let topLevel = [
    "DOUBLE POINTS!!!"
  ];

  if (numOfWins <= 2){
    compliments = bottomLevel
  } else if (numOfWins > 2 && numOfWins < 5){
    compliments = middleLevel
  } else {
    compliments = topLevel
  }

  let compIndex = Math.floor(Math.random() * compliments.length);
  return compliments[compIndex];
}

// Displays a modal message for a win and adds chips. Turnary to check display custom messages
// for blackJack
function playerWins() {
  winsInARow++;
  winsInARow > 4 ? player.chips += 100 : player.chips += 50;
  
  updateChips();
 
  modal.innerHTML = `<h2 id='modal-message'>${
    getPlayerSum() === 21
      ? "You got a <span class='got-blackjack'>BlackJack! </span>"
      : ""
  }You Win! 🙂</h2><h2>${
    winsInARow > 1
      ? `${randomCompliment(winsInARow)} That is <span id='in-a-row'>${winsInARow} wins in a row!</span>`
      : ""
  }</h2><br><button onclick='confirmHandler()' class='btn' id='confirm'>OK</button>`;
  document.getElementById("overlay").style.display = "flex";
  winner = player.name;
  if(player.chips >= 1000){
    gameWon()
  }
  
}

// Displays a modal message for a loss and removes chips.
function playerLoses() {
  winsInARow = 0;
  modal.innerHTML = `<h2 id="modal-message">You Lose 😥</h2><button onclick="confirmHandler()" class="btn" id="confirm">OK</button>`;
  document.getElementById("overlay").style.display = "flex";
  winner = "Dealer";
  player.chips -= 50;
  updateChips();
}

// Compares both hands and determines the winner based on common blackjack rules.
function checkWinner() {
  let dlr = getDealerSum();
  let plyr = getPlayerSum();

  if (dlr > 21) {
    playerWins();
  } else if (plyr < 21 && playerCardsArray.length > 4) {
    playerWins();
  } else if (dlr === 21) {
    playerLoses();
  } else if (dlr === plyr) {
    playerDraw();
  } else if (dlr > plyr && dlr < 22) {
    playerLoses();
  } else {
    playerWins();
  }
}

// Draws one card from the API deck and adds it to the DEALER array then checks for winner
function dealerTakeCard() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
    .then((res) => res.json())
    .then((data) => {
      dealerCardsArray.push(data.cards[0]);
      renderGame(playerCardsArray, dealerCardsArray);
      checkWinner();
    });
}

// Checks if (dealer <= player) and dealer is not 21, the dealer will draw one card
// and check for the winner.
function dealerTurn() {
  let dealer = getDealerSum();
  let player = getPlayerSum();
  if (dealer <= player && dealer != 21) {
    dealerTakeCard();
  } else {
    checkWinner();
  }
}

// Resets the table and both arrays, gets a new deck and deals new starting cards
function startNewGame() {
  overlay.style.display = "none";
  player.chips = 250;
  updateChips();
  newHand();
  startGame();
}

// Closes the modal overlay
function cancelNewGame() {
  overlay.style.display = "none";
}

// Displays message asking if the player wants to reset and start a new game or not
function confirmNewGame() {
  modal.innerHTML = `<h2 id="modal-message">Would you like to start a new game?</h2><div class="buttons"><button onclick="startNewGame()" class="btn" id="confirm">YES</button><button class="btn" onclick="cancelNewGame()">NO</button></div>`;
  overlay.style.display = "flex";
}

function clickEffect() {
  dealCard.classList.toggle("clicked");
  console.log("button was clicked ");
}

// Clears the modal overlay, clears the table and both arrays, deals starting cards
function confirmHandler() {
  overlay.style.display = "none";
  newHand();
  dealStartingCards();
}

// ------------------  MAIN GAME LOGIC  ---------------------
function renderGame(playerArr, dealerArr) {
  playerCards.innerHTML = "";
  dealerCards.innerHTML = "";
  let currentTotal = getPlayerSum();
  let dealerCurrentTotal = getDealerSum();
  for (let card of playerArr) {
    playerCards.innerHTML += `<img class="card-image" src="${card.image}">`;
  }
  for (let dCard of dealerArr) {
    dealerCards.innerHTML += `<img class="card-image" src="${dCard.image}">`;
  }
  playerSumEl.textContent = `You: ${currentTotal}`;
  dealerSumEl.textContent = `Dealer: ${dealerCurrentTotal}`;

  if (currentTotal <= 20) {
    playerMessage.textContent = "Would you like to draw another card?";
  } else if (currentTotal === 21) {
    playerMessage.textContent = "You've got BlackJack!";
    playerWins();
  } else if (currentTotal < 21 && playerArr.length > 4) {
    playerWins();
  } else {
    playerMessage.textContent = "Sorry! You've bust..";
    playerLoses();
  }
}

// Event listener for the initial Welcome Screen modal, dismisses screen and starts game
newDeck.addEventListener("click", () => {
  overlay.style.display = "none";
  dealStartingCards;
});

// Deals single card to player
dealCard.addEventListener("click", dealSingleCard);

// After winner is determined, OK will clear the board and both arrays, deal starting
// cards and then prompt the player for another card
okBtn.addEventListener("click", () => {
  newHand();
  dealStartingCards();
  playerMessage.textContent = "Would you like to draw another card?";
});

// Hitting the stay button will switch turns to the dealer
stayBtn.addEventListener("click", dealerTurn);

// Clicking new game button will ask to confirm starting a new game
newGameBtn.addEventListener("click", confirmNewGame);
