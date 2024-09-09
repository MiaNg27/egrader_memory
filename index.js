

const deck = document.querySelector(".deck");
let opened = [];
let matched = [];
let gameMode = "easy";

const modal = document.getElementById("modal");
const startModal = document.getElementById("start-modal");

const reset = document.querySelector(".reset-btn");
const playAgain = document.getElementById("play-again");
const movesCount = document.querySelector(".moves-counter");

const easyGame = document.getElementById("easyGame");
const mediumGame = document.getElementById("mediumGame");
const hardGame = document.getElementById("hardGame");

let moves = 0;
const star = document.getElementById("star-rating").querySelectorAll(".star");
let starCount = 3;
const timeCounter = document.querySelector(".timer");
let time;
let minutes = 0;
let seconds = 0;
let timeStart = false;

let best_moves = 0;
let best_time = 0;

function getBestScores(bestMoves, bestTime) {
  if (localStorage.getItem(bestMoves)) {
    best_moves = localStorage.getItem(bestMoves);
  }
  if (localStorage.getItem(bestTime)) {
    best_time = localStorage.getItem(bestTime);
  }
}

//Function for setting the best score to localStorage
function setBestScores(bestMoves, bestTime) {
  localStorage.setItem(bestMoves, best_moves);
  localStorage.setItem(bestTime, best_time);
}

function showModalStart() {
  startModal.style.display = "block";
}

showModalStart();

function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
let lastFlippedCardNumber = null;
function startGame() {
  let cards;
  if (gameMode === "easy") {
    cards = Array.from({length: 4}, (_, i) => i+1);
    deck.classList.add("easy");
  } else if (gameMode === "medium") {
    deck.classList.add("medium");
    cards = Array.from({length: 8}, (_, i) => i+1);
  } else {
    deck.classList.add("hard");
    cards = Array.from({length: 16}, (_, i) => i+1);
  }

  const shuffledDeck = shuffle(cards);
  for (let i = 0; i < shuffledDeck.length; i++) {
    const liTag = document.createElement("LI");
    liTag.classList.add("card");

  const numberTag = document.createElement("SPAN");
  numberTag.classList.add("card-number");
  numberTag.textContent = shuffledDeck[i]; // Set the text content to the number
  liTag.appendChild(numberTag);


    const divTag = document.createElement("DIV");
    divTag.classList.add("tilt");
    divTag.appendChild(liTag);
    numberTag.style.opacity = "1";
    updateReflection(liTag, 100, 0);
    liTag.addEventListener("mousemove", (event) => {
      const scale = 0.03;
      const midX = (liTag.clientHeight / 2) * scale;
      const mouseXoffset = event.offsetX * scale;
      const mouseX = mouseXoffset - midX;

      const midY = (liTag.clientWidth / 2) * scale;
      const mouseYoffset = event.offsetY * scale;
      const mouseY = mouseYoffset - midY;
      updateReflection(liTag, mouseX * 50, mouseY * 50);
      liTag.style.transform = rotation;
    });

    liTag.addEventListener("click", (event) => {
      if (lastFlippedCardNumber === null || lastFlippedCardNumber - 1 === shuffledDeck[i]) {
        liTag.style.transform = `rotateY(180deg)`;
        lastFlippedCardNumber = shuffledDeck[i];
      } else {
        numberTag.style.opacity = "0"; // Hide the number if it's not the correct card
      }
    });
    deck.appendChild(divTag);
  }
    setTimeout(() => {
    const allNumbers = document.querySelectorAll(".card-number");
    allNumbers.forEach(number => {
      number.style.opacity = "0";
    });
  }, 4000);
}

function removeCard() {
  while (deck.hasChildNodes()) {
    deck.removeChild(deck.firstChild);
  }
}

function timer() {
  time = setInterval(function () {
    seconds++;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }

    timeCounter.innerHTML =
      minutes.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      }) +
      ":" +
      seconds.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      });
  }, 1000);
}

function stopTime() {
  clearInterval(time);
}

function resetEverything() {

  stopTime();
  timeStart = false;
  seconds = 0;
  minutes = 0;
  timeCounter.innerHTML = "00:00";

  star[1].firstElementChild.classList.add("fa-star");
  star[2].firstElementChild.classList.add("fa-star");
  starCount = 3;

  moves = 0;
  movesCount.innerHTML = 0;

  matched = [];
  opened = [];
  // Clear the deck
  removeCard();

  if (gameMode === "easy") deck.classList.remove("easy");
  else if (gameMode === "medium") deck.classList.remove("medium");
  else deck.classList.remove("hard");
  startModal.style.display = "block";
}

function movesCounter() {
  movesCount.innerHTML++;
  moves++;
}

function starRating() {
  if (moves === 14) {
    star[2].firstElementChild.classList.remove("fa-star");
    starCount--;
  }
  if (moves === 18) {
    star[1].firstElementChild.classList.remove("fa-star");
    starCount--;
  }
}

function compareTwo() {
  if (opened.length === 2) {
    document.body.style.pointerEvents = "none";
  }
  // Get the card numbers
  const cardNumber1 = Number(opened[0].textContent);
  const cardNumber2 = Number(opened[1].textContent);

  if (cardNumber1 === cardNumber2 - 1) {
    match();
  } else if (cardNumber1 !== cardNumber2 - 1) {
    noMatch();
  }
}

function match() {
  setTimeout(function () {
    opened[0].parentElement.classList.add("match");
    opened[1].parentElement.classList.add("match");

    matched.push(...opened);
    document.body.style.pointerEvents = "auto";

    const isIncreasingOrder = matched.every((card, index, arr) => {
      if (index === 0) {
        return true;
      } else {
        return Number(card.textContent) > Number(arr[index - 1].textContent);
      }
    });

    if (isIncreasingOrder) {
      winGame();
    }

    opened = [];
  }, 600);
  movesCounter();
  starRating();
}

function noMatch() {
  setTimeout(function () {
    // Get the card numbers
    const cardNumber1 = Number(opened[0].textContent);
    const cardNumber2 = Number(opened[1].textContent);

    // Check if the card numbers are not consecutive
    if (Math.abs(cardNumber1 - cardNumber2) !== 1) {
      // Remove class flip on images parent element
      opened[0].parentElement.classList.remove("flip");
      opened[1].parentElement.classList.remove("flip");
      // Hide the card numbers
      opened[0].style.opacity = "0";
      opened[1].style.opacity = "0";
    }

    // Allow further mouse clicks on cards
    document.body.style.pointerEvents = "auto";
    // Remove the cards from opened array
    opened = [];
  }, 700);
  // Call movesCounter to increment by one
  movesCounter();
  starRating();
}

function calculateBestScores(bestMoves, bestTime) {
  let total_time = minutes * 60 + seconds;
  best_moves = 0;
  best_time = 0;
  // When The browser has no best moves, or no best time
  getBestScores(bestMoves, bestTime);
  if (best_moves == 0 || best_time == 0) {
    best_moves = moves;
    best_time = total_time;
  } else {
    // If best move and best time are found compare the lowest best time and best move
    best_moves = Math.min(best_moves, moves);
    best_time = Math.min(best_time, total_time);
  }
  setBestScores(bestMoves, bestTime);
}

function AddStats() {
  const details = document.getElementById("modal-details");

  for (let i = 1; i <= 3; i++) {
    const statsElement = document.createElement("p");
    statsElement.classList.add("stats");
    details.appendChild(statsElement);
  }

  let p = details.querySelectorAll("p.stats");
  let best_minute = Math.floor(best_time / 60);
  let best_second = best_time % 60;

  p[0].innerHTML = `Time taken: ${minutes} Minutes and ${seconds} Seconds (Best Time: ${best_minute} Minutes and ${best_second} Seconds)`;
  p[1].innerHTML = `Moves Taken: ${moves} (Best Moves: ${best_moves})`;
  p[2].innerHTML = `Your Star Rating is: ${starCount}/3`;
}
function displayModal() {

  const modalClose = document.getElementsByClassName("close")[0];
  modal.style.display = "block";

  modalClose.onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

function winGame() {
  let len = 0;
  if (gameMode === "easy") len = 4;
  else len = gameMode === "medium" ? 8 : 16;

  if (matched.length === len) {
    stopTime();
    if (gameMode === "hard") {
      calculateBestScores("bestMovesHard", "bestTimeHard");
    } else if (gameMode === "medium") {
      calculateBestScores("bestMovesMedium", "bestTimeMedium");
    } else {
      calculateBestScores("bestMovesEasy", "bestTimeEasy");
    }
    AddStats();
    displayModal();
  }
}

deck.addEventListener("click", function (evt) {
  if (evt.target.nodeName === "LI") {

    if (timeStart === false) {
      timeStart = true;
      timer();
    }

    flipCard();
  }

function flipCard() {
  evt.target.classList.add("flip", "card");
  evt.target.querySelector(".card-number").style.opacity = "1";
  addToOpened();
}

  function addToOpened() {

    if (opened.length === 0 || opened.length === 1) {
      opened.push(evt.target.firstElementChild);
    }

    compareTwo();
  }
});

reset.addEventListener("click", resetEverything);

easyGame.addEventListener("click", function () {
  console.log("ENTROU");
  startModal.style.display = "none";
  gameMode = "easy";
  startGame();
});

mediumGame.addEventListener("click", function () {
  startModal.style.display = "none";
  gameMode = "medium";
  console.log("ENTROU");
  startGame();
});

hardGame.addEventListener("click", function () {
  startModal.style.display = "none";
  gameMode = "hard";
  console.log("ENTROU");
  startGame();
});

playAgain.addEventListener("click", function () {
  modal.style.display = "none";
  resetEverything();
});

function updateReflection(card, degree, percentage) {
  card.style.background = `linear-gradient(${degree}deg, rgba(23, 180, 109 ,0.6) 0%,rgba(23, 180, 109,0.8) ${percentage}%,rgba(23, 180, 109,0.7) 100%)`;
  card.style.backgroundSize = "cover";
}
