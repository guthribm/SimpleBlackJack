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

let playerSum = 0;
let dealerSum = 0;
let hasBlackJack = false;
let isAlive = false;
let message = "";
let winner = "";

function gameOver() {
  document.getElementById("overlay").style.display = "flex";
  modal.innerHTML = `<h2>You are out of chips. Game Over..</h2><br><button class="btn" onclick="startNewGame()">NEW GAME</button>`;
  document.getElementById("new-deck").textContent = "New Game";
  console.log("Game Over");
}

function updateChips() {
  playerName.textContent = `CHIPS: $${player.chips}`;
  if (player.chips <= 0) {
    gameOver();
  }
}

function getDeckId() {
  fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then((res) => res.json())
    .then((data) => {
      deckId = data.deck_id;
      console.log(`data.deck_id: ${data.deck_id}`);
    })
    .then(dealStartingCards);
}

function reshuffleCards() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);
}

function dealStartingCards() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`)
    .then((res) => res.json())
    .then((data) => {
      if (data.remaining < 6) {
        console.log(`FEW CARDS remaining: ${data.remaining}`);
        console.log("before " + deckId);
        reshuffleCards();
      }
      console.log("after " + deckId);
      console.log(`RESHUFFLED DECK: ${data.remaining}`);
      dealerCardsArray.push(data.cards[0], data.cards[1]);
      playerCardsArray.push(data.cards[2], data.cards[3]);
      renderGame(playerCardsArray, dealerCardsArray);
      updateChips();
      dealerSum =
        convertValue(data.cards[0].value) + convertValue(data.cards[1].value);
      playerSum =
        convertValue(data.cards[2].value) + convertValue(data.cards[3].value);
      console.log(`player start: ${playerSum} dealer start: ${dealerSum}`);
    });
}


function dealSingleCard() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
    .then((res) => res.json())
    .then((data) => {
      playerCardsArray.push(data.cards[0]);
      renderGame(playerCardsArray, dealerCardsArray);
    });
}

function startGame() {
  getDeckId();
  renderGame(playerCardsArray, dealerCardsArray);
}

function convertValue(value) {
  let cardValue = 0;
  if (value === "KING" || value === "JACK" || value === "QUEEN") {
    cardValue = 10;
  } else if (value === "ACE") {
    if (playerSum < 11) {
      cardValue = 11;
    } else {
      cardValue = 1;
    }
  } else {
    cardValue = parseInt(value);
  }

  return cardValue;
}

function getPlayerSum() {
  let p1Sum = 0;
  let convertedPSum = playerCardsArray.map((item) => item.value);
  for (let item of convertedPSum) {
    p1Sum += convertValue(item);
  }
  console.log("player 1 sum: " + p1Sum);
  return p1Sum;
}

function getDealerSum() {
  let dealerSum = 0;
  let convertedDSum = dealerCardsArray.map((item) => item.value);
  for (let item of convertedDSum) {
    dealerSum += convertValue(item);
  }
  console.log("get dealer 1 sum: " + dealerSum);
  document.getElementById("dealer-sum").textContent = `Dealer: ${dealerSum}`;
  return dealerSum;
}

function newHand() {
  playerCards.innerHTML = "";
  dealerCards.innerHTML = "";
  playerCardsArray = [];
  dealerCardsArray = [];
}

function playerDraw() {
  modal.innerHTML = `<h2 id="modal-message">Draw!</h2><button onclick="confirmHandler()" class="btn" id="confirm">OK</button>`;
  document.getElementById("overlay").style.display = "flex";
}

function playerWins() {
  modal.innerHTML = `<h2 id="modal-message">You Win!</h2><button onclick="confirmHandler()" class="btn" id="confirm">OK</button>`;
  document.getElementById("overlay").style.display = "flex";
  winner = player.name;
  player.chips += 50;
  updateChips();
}

function playerLoses() {
  modal.innerHTML = `<h2 id="modal-message">You Lose</h2><button onclick="confirmHandler()" class="btn" id="confirm">OK</button>`;
  document.getElementById("overlay").style.display = "flex";
  winner = "Dealer";
  player.chips -= 50;
  updateChips();
}

function dealerTurn() {
  checkWinner();
  let total = getDealerSum();

  if (total <= getPlayerSum()) {
    dealerTakeCard();
  }
  renderGame(playerCardsArray, dealerCardsArray);
  checkWinner();
}

function checkWinner() {
  let dlr = getDealerSum();
  let plyr = getPlayerSum();

  if (dlr > 21) {
    playerWins();
  } else if (dlr === 21) {
    playerMessage.textContent = "Dealer got BlackJack!";
    playerLoses();
  } else if (dlr === plyr) {
    playerDraw();
  } else if (dlr > plyr && dlr < 22) {
    playerLoses();
    // toggleOK();
    // resetBoard();
  } else {
    playerWins();
  }
  // playerMessage.textContent = `\n${winner} WINS!\n`;
  // toggleOKOn();
}

function dealerTakeCard() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
    .then((res) => res.json())
    .then((data) => {
      dealerCardsArray.push(data.cards[0]);
      renderGame(playerCardsArray, dealerCardsArray);
      checkWinner();
    })
    .then(
      console.log(`dealerArray: ${dealerCardsArray}\ndealer sum: ${dealerSum}`)
    );
}

function dealerTurn() {
  let dealer = getDealerSum();
  let player = getPlayerSum();
  if (dealer <= player && dealer != 21) {
    dealerTakeCard();
  } else {
    checkWinner();
  }
}

function toggleOKOn() {
  okBtn.style.display = "block";
  dealCard.style.visibility = "hidden";
  stayBtn.style.visibility = "hidden";
}

function toggleOKOff() {
  okBtn.style.display = "none";
  dealCard.style.visibility = "visible";
  stayBtn.style.visibility = "visible";
}

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
    hasBlackJack = true;
    isAlive = false;
  } else if (currentTotal < 21 && playerArr.length == 5) {
    playerWins();
  } else {
    playerMessage.textContent = "Sorry! You've bust..";
    playerLoses();
    isAlive = false;
  }
}

function confirmHandler() {
  console.log("confirm handler clicked");
  toggleOKOff();
  document.getElementById("overlay").style.display = "none";
  newHand();
  dealStartingCards();
}

newDeck.addEventListener("click", () => {
  newDeck.style.visibility = "hidden";
  dealCard.style.visibility = "visible";
  stayBtn.style.visibility = "visible";
  document.getElementById("overlay").style.display = "none";
  dealStartingCards;
});

dealCard.addEventListener("click", dealSingleCard);

okBtn.addEventListener("click", () => {
  toggleOKOff();
  newHand();
  dealStartingCards();
  playerMessage.textContent = "Would you like to draw another card?";
});

stayBtn.addEventListener("click", dealerTurn);

function startNewGame() {
  document.getElementById("overlay").style.display = "none";
  player.chips = 250;
  newHand();
  startGame();
}
newGameBtn.addEventListener("click", startNewGame);
