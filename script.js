const quizContainer = document.getElementById("quiz-container");
const modeSelection = document.getElementById("mode-selection");
const gameContainer = document.getElementById("game-container");
const questionContainer = document.getElementById("question-container");
const scoreDisplay = document.getElementById("score");
const maxScoreDisplay = document.getElementById("max-score");
const questionNumberDisplay = document.getElementById("question-number");
const totalQuestionsDisplay = document.getElementById("total-questions");
const progressBar = document.getElementById("progress");
let currentQuestion = 0;
let score = 0;
let totalQuestions = 0;
const POINTS_PER_QUESTION = 10;
const FALLBACK_IMAGE = "https://via.placeholder.com/350x200?text=Image+Indisponible";
let selectedImages = [];
let usedImages = [];

// Mélanger les images pour randomiser
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Démarrer le quiz avec le nombre de questions choisi
function startQuiz(numQuestions) {
  modeSelection.style.display = "none";
  gameContainer.style.display = "block";
  
  totalQuestions = numQuestions === "all" ? dinosaurImages.length : parseInt(numQuestions);
  maxScoreDisplay.textContent = totalQuestions * POINTS_PER_QUESTION;
  totalQuestionsDisplay.textContent = totalQuestions;
  
  // Réinitialiser
  currentQuestion = 0;
  score = 0;
  scoreDisplay.textContent = score;
  usedImages = [];
  selectedImages = shuffleArray([...dinosaurImages]).slice(0, totalQuestions);
  
  updateProgressBar();
  loadQuestion();
}

// Mettre à jour la barre de progression
function updateProgressBar() {
  const progressPercent = (currentQuestion / totalQuestions) * 100;
  progressBar.style.width = `${progressPercent}%`;
}

// Charger une question
function loadQuestion() {
  if (currentQuestion >= totalQuestions) {
    questionContainer.innerHTML = `
      <h2>Quiz terminé !</h2>
      <p>Votre score final : ${score} / ${totalQuestions * POINTS_PER_QUESTION}</p>
      <button onclick="restartQuiz()">Recommencer</button>
    `;
    scoreDisplay.textContent = score;
    progressBar.style.width = "100%";
    return;
  }

  const dinoName = selectedImages[currentQuestion];
  const imagePath = `./dinos/${dinoName}.jpg`;
  questionContainer.innerHTML = `
    <img src="${imagePath}" alt="${dinoName}" class="loading" onload="this.classList.add('loaded')" onerror="this.src='${FALLBACK_IMAGE}'">
    <h2>Quel est le nom de ce dinosaure ?</h2>
    <input type="text" id="answer" placeholder="Entrez le nom" autocomplete="off">
    <button onclick="checkAnswer()">Soumettre</button>
    <div id="result-message"></div>
  `;
  questionNumberDisplay.textContent = currentQuestion + 1;
  updateProgressBar();
}

// Vérifier la réponse
function checkAnswer() {
  const answerInput = document.getElementById("answer");
  const resultMessage = document.getElementById("result-message");
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = selectedImages[currentQuestion].toLowerCase();
  
  answerInput.disabled = true;
  document.querySelector("button[onclick='checkAnswer()']").style.display = "none";
  
  if (userAnswer === correctAnswer) {
    score += POINTS_PER_QUESTION;
    resultMessage.textContent = "Correct ! +10 points";
    resultMessage.className = "correct";
  } else {
    resultMessage.textContent = `Faux ! La réponse correcte est ${selectedImages[currentQuestion]}`;
    resultMessage.className = "incorrect";
  }
  
  scoreDisplay.textContent = score;
  usedImages.push(selectedImages[currentQuestion]);
  questionContainer.innerHTML += `<button onclick="nextQuestion()">Suivant</button>`;
}

// Passer à la question suivante
function nextQuestion() {
  currentQuestion++;
  loadQuestion();
}

// Recommencer le quiz
function restartQuiz() {
  modeSelection.style.display = "block";
  gameContainer.style.display = "none";
  questionContainer.innerHTML = "";
  usedImages = [];
}