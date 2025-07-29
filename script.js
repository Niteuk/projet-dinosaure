const quizContainer = document.getElementById("quiz-container");
const modeSelection = document.getElementById("mode-selection");
const gameContainer = document.getElementById("game-container");
const questionContainer = document.getElementById("question-container");
const scoreDisplay = document.getElementById("score");
const maxScoreDisplay = document.getElementById("max-score");
const questionNumberDisplay = document.getElementById("question-number");
const totalQuestionsDisplay = document.getElementById("total-questions");
const progressBar = document.getElementById("progress");
const resetButton = document.getElementById("reset-button");
let currentQuestion = 0;
let score = 0;
let totalQuestions = 0;
const POINTS_PER_QUESTION = 10;
const FALLBACK_IMAGE = "https://via.placeholder.com/350x200?text=Image+Indisponible";
let selectedImages = [];
let usedImages = [];
let learningMode = false;
let knownImages = new Set(JSON.parse(localStorage.getItem("knownDinosaurs")) || []);
let skippedImages = new Set(JSON.parse(localStorage.getItem("skippedDinosaurs")) || []);
let learningPool = [];
let successes = 0;
let totalAttempts = 0;
let errorScores = JSON.parse(localStorage.getItem("errorScores")) || {};

// Mélanger les images pour randomiser
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Mettre à jour le pool d'apprentissage
function updateLearningPool() {
  let availableDinosaurs = dinosaurImages.filter(d => !skippedImages.has(d) && !knownImages.has(d));
  let pool = [];
  for (let dino of availableDinosaurs) {
    let count = Math.min(3, Math.floor(errorScores[dino] || 0)); // Max 3 répétitions
    for (let i = 0; i <= count; i++) pool.push(dino);
  }
  learningPool = shuffleArray(pool).slice(0, 15); // Limite à 15
  if (learningPool.length < 15 && availableDinosaurs.length > 0) {
    learningPool = shuffleArray(learningPool.concat(availableDinosaurs.filter(d => !learningPool.includes(d))).slice(0, 15));
  }
}

// Démarrer le quiz classique
function startQuiz(numQuestions) {
  learningMode = false;
  modeSelection.style.display = "none";
  gameContainer.style.display = "block";
  document.getElementById("progress-container").style.display = "block";
  resetButton.style.display = "none";
  
  totalQuestions = numQuestions === "all" ? dinosaurImages.length : parseInt(numQuestions);
  maxScoreDisplay.textContent = totalQuestions * POINTS_PER_QUESTION;
  totalQuestionsDisplay.textContent = totalQuestions;
  
  currentQuestion = 0;
  score = 0;
  scoreDisplay.textContent = score;
  usedImages = [];
  selectedImages = shuffleArray([...dinosaurImages]).slice(0, totalQuestions);
  
  updateProgressBar();
  loadQuestion();
}

// Démarrer le mode apprentissage
function startLearningMode() {
  learningMode = true;
  modeSelection.style.display = "none";
  gameContainer.style.display = "block";
  document.getElementById("progress-container").style.display = "none";
  resetButton.style.display = "block";
  
  currentQuestion = 0;
  successes = 0;
  totalAttempts = 0;
  updateLearningPool();
  updateSuccessDisplay();
  loadLearningQuestion();
}

// Mettre à jour la barre de progression
function updateProgressBar() {
  const progressPercent = (currentQuestion / totalQuestions) * 100;
  progressBar.style.width = `${progressPercent}%`;
}

// Charger une question classique
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

// Charger une question en mode apprentissage
function loadLearningQuestion() {
  if (learningPool.length === 0) {
    questionContainer.innerHTML = `
      <h2>Apprentissage terminé !</h2>
      <p>Tous les dinosaures sont appris ou skippés.</p>
      <button onclick="restartLearning()">Recommencer l'apprentissage</button>
    `;
    return;
  }

  const currentDinoIndex = currentQuestion % learningPool.length;
  const dinoName = learningPool[currentDinoIndex];
  const imagePath = `./dinos/${dinoName}.jpg`;
  questionContainer.innerHTML = `
    <img src="${imagePath}" alt="${dinoName}" class="loading" onload="this.classList.add('loaded')" onerror="this.src='${FALLBACK_IMAGE}'">
    <h2>Quel est le nom de ce dinosaure ?</h2>
    <input type="text" id="answer" placeholder="Entrez le nom" autocomplete="off">
    <button onclick="checkAnswer()">Soumettre</button>
    <div id="result-message"></div>
    <button id="learned-button" onclick="markAsLearned()">Marquer comme appris</button>
    <button id="skip-button" onclick="skipQuestion()">Skip</button>
    <div id="success-count"></div>
  `;
  updateSuccessDisplay();
}

// Mettre à jour l'affichage des réussites
function updateSuccessDisplay() {
  const successCount = document.getElementById("success-count");
  if (successCount) successCount.textContent = `Réussites : ${successes} / ${totalAttempts}`;
}

// Vérifier la réponse
function checkAnswer() {
  const answerInput = document.getElementById("answer");
  const resultMessage = document.getElementById("result-message");
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = learningMode ? learningPool[currentQuestion % learningPool.length] : selectedImages[currentQuestion];
  const dinoName = correctAnswer.toLowerCase();

  answerInput.disabled = true;
  document.querySelector("button[onclick='checkAnswer()']").style.display = "none";

  if (userAnswer === dinoName) {
    if (learningMode) successes++;
    else score += POINTS_PER_QUESTION;
    resultMessage.textContent = "Correct !";
    resultMessage.className = "correct";
    if (errorScores[dinoName]) delete errorScores[dinoName]; // Réinitialiser le score d'erreur en cas de succès
  } else {
    resultMessage.textContent = `Faux ! La réponse correcte est ${correctAnswer}`;
    resultMessage.className = "incorrect";
    errorScores[dinoName] = (errorScores[dinoName] || 0) + 1;
  }

  if (learningMode) {
    totalAttempts++;
    updateSuccessDisplay();
    localStorage.setItem("errorScores", JSON.stringify(errorScores));
    updateLearningPool();
    questionContainer.innerHTML += `<button onclick="nextLearningQuestion()">Suivant</button>`;
  } else {
    scoreDisplay.textContent = score;
    usedImages.push(selectedImages[currentQuestion]);
    questionContainer.innerHTML += `<button onclick="nextQuestion()">Suivant</button>`;
  }
}

// Passer à la question suivante (mode classique)
function nextQuestion() {
  currentQuestion++;
  loadQuestion();
}

// Passer à la question suivante (mode apprentissage)
function nextLearningQuestion() {
  currentQuestion++;
  loadLearningQuestion();
}

// Marquer comme appris
function markAsLearned() {
  const dinoName = learningPool[currentQuestion % learningPool.length];
  knownImages.add(dinoName);
  localStorage.setItem("knownDinosaurs", JSON.stringify([...knownImages]));
  learningPool = learningPool.filter(d => d !== dinoName);
  updateLearningPool();
}

// Skip une question
function skipQuestion() {
  const dinoName = learningPool[currentQuestion % learningPool.length];
  skippedImages.add(dinoName);
  localStorage.setItem("skippedDinosaurs", JSON.stringify([...skippedImages]));
  learningPool = learningPool.filter(d => d !== dinoName);
  updateLearningPool();
  nextLearningQuestion();
}

// Recommencer le quiz classique
function restartQuiz() {
  modeSelection.style.display = "block";
  gameContainer.style.display = "none";
  questionContainer.innerHTML = "";
  usedImages = [];
  document.getElementById("progress-container").style.display = "block";
  resetButton.style.display = "none";
}

// Recommencer le mode apprentissage
function restartLearning() {
  modeSelection.style.display = "block";
  gameContainer.style.display = "none";
  questionContainer.innerHTML = "";
  document.getElementById("progress-container").style.display = "block";
  resetButton.style.display = "none";
}

// Réinitialiser les dinosaures appris
function resetLearnedDinosaurs() {
  knownImages.clear();
  skippedImages.clear();
  errorScores = {};
  localStorage.removeItem("knownDinosaurs");
  localStorage.removeItem("skippedDinosaurs");
  localStorage.removeItem("errorScores");
  alert("La liste des dinosaures appris a été réinitialisée.");
  if (learningMode) startLearningMode();
}