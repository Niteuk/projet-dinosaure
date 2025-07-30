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
let currentDinoName = "";
let hasAnsweredCorrectly = false;

// Gestion responsive des listes
function updateResponsiveLists() {
  const isMobile = window.innerWidth <= 1000;
  const desktopPanels = document.querySelectorAll('.main-container .side-panel');
  const mobilePanels = document.getElementById('mobile-panels');
  
  if (isMobile) {
    // Afficher les listes mobiles en bas
    desktopPanels.forEach(panel => panel.style.display = 'none');
    mobilePanels.style.display = 'flex';
  } else {
    // Afficher les listes desktop sur les côtés
    desktopPanels.forEach(panel => panel.style.display = 'block');
    mobilePanels.style.display = 'none';
  }
  
  updateLists();
}

// Mettre à jour les listes des dinosaures
function updateLists() {
  const learnedArray = [...knownImages].sort();
  const skippedArray = [...skippedImages].sort();
  
  // Desktop
  updateListContent('learned-list', learnedArray, 'learned-item');
  updateListContent('skipped-list', skippedArray, 'skipped-item');
  document.getElementById('learned-counter').textContent = learnedArray.length;
  document.getElementById('skipped-counter').textContent = skippedArray.length;
  
  // Mobile
  updateListContent('learned-list-mobile', learnedArray, 'learned-item');
  updateListContent('skipped-list-mobile', skippedArray, 'skipped-item');
  document.getElementById('learned-counter-mobile').textContent = learnedArray.length;
  document.getElementById('skipped-counter-mobile').textContent = skippedArray.length;
}

function updateListContent(listId, items, itemClass) {
  const list = document.getElementById(listId);
  if (!list) return;
  
  list.innerHTML = '';
  
  if (items.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Aucun';
    emptyItem.style.fontStyle = 'italic';
    emptyItem.style.opacity = '0.6';
    list.appendChild(emptyItem);
    return;
  }
  
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    li.className = itemClass;
    list.appendChild(li);
  });
}

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
    let errorCount = errorScores[dino] || 0;
    let repetitions = Math.min(3, Math.max(1, errorCount));
    for (let i = 0; i < repetitions; i++) {
      pool.push(dino);
    }
  }
  
  learningPool = shuffleArray(pool);
  
  console.log(`Pool d'apprentissage mis à jour: ${learningPool.length} questions`);
  console.log(`Dinosaures disponibles: ${availableDinosaurs.length}`);
  console.log(`Dinosaures connus: ${knownImages.size}`);
  console.log(`Dinosaures skippés: ${skippedImages.size}`);
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
  hasAnsweredCorrectly = false;
  
  updateLearningPool();
  
  if (learningPool.length === 0) {
    questionContainer.innerHTML = `
      <h2>Félicitations ! 🎉</h2>
      <p>Vous avez terminé l'apprentissage de tous les dinosaures disponibles !</p>
      <p>Dinosaures appris : ${knownImages.size}</p>
      <p>Dinosaures skippés : ${skippedImages.size}</p>
      <button onclick="restartLearning()">Retour au menu</button>
    `;
    return;
  }
  
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
  
  // Permettre la soumission avec Entrée
  document.getElementById("answer").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });
  
  // Focus sur l'input
  setTimeout(() => {
    document.getElementById("answer").focus();
  }, 100);
}

// Charger une question en mode apprentissage
function loadLearningQuestion() {
  if (learningPool.length === 0) {
    questionContainer.innerHTML = `
      <h2>Apprentissage terminé ! 🎉</h2>
      <p>Tous les dinosaures disponibles sont appris ou skippés.</p>
      <p>Réussites totales : ${successes} / ${totalAttempts}</p>
      <button onclick="restartLearning()">Retour au menu</button>
    `;
    return;
  }

  const randomIndex = Math.floor(Math.random() * learningPool.length);
  currentDinoName = learningPool[randomIndex];
  hasAnsweredCorrectly = false;
  
  const imagePath = `./dinos/${currentDinoName}.jpg`;
  questionContainer.innerHTML = `
    <img src="${imagePath}" alt="${currentDinoName}" class="loading" onload="this.classList.add('loaded')" onerror="this.src='${FALLBACK_IMAGE}'">
    <h2>Quel est le nom de ce dinosaure ?</h2>
    <input type="text" id="answer" placeholder="Entrez le nom" autocomplete="off">
    <button onclick="checkAnswer()">Soumettre</button>
    <div id="result-message"></div>
    <div id="learning-buttons" style="display: none;">
      <button id="learned-button" onclick="markAsLearned()">Marquer comme appris ✅</button>
      <button id="skip-button" onclick="skipQuestion()">Skip ⏭️</button>
    </div>
    <div id="success-count"></div>
  `;
  
  updateSuccessDisplay();
  
  // Permettre la soumission avec Entrée
  document.getElementById("answer").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });
  
  // Focus sur l'input
  setTimeout(() => {
    document.getElementById("answer").focus();
  }, 100);
}

// Mettre à jour l'affichage des réussites
function updateSuccessDisplay() {
  const successCount = document.getElementById("success-count");
  if (successCount) {
    const availableDinos = dinosaurImages.length - knownImages.size - skippedImages.size;
    successCount.innerHTML = `
      <p>Réussites : ${successes} / ${totalAttempts}</p>
      <p>Dinosaures restants : ${availableDinos}</p>
      <p>Appris : ${knownImages.size} | Skippés : ${skippedImages.size}</p>
    `;
  }
}

// Vérifier la réponse
function checkAnswer() {
  const answerInput = document.getElementById("answer");
  const resultMessage = document.getElementById("result-message");
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = learningMode ? currentDinoName : selectedImages[currentQuestion];
  const dinoName = correctAnswer.toLowerCase();

  answerInput.disabled = true;
  const submitButton = document.querySelector("button[onclick='checkAnswer()']");
  if (submitButton) submitButton.style.display = "none";

  if (userAnswer === dinoName) {
    hasAnsweredCorrectly = true;
    if (learningMode) successes++;
    else score += POINTS_PER_QUESTION;
    
    resultMessage.textContent = "Correct ! 🎉";
    resultMessage.className = "correct";
    
    if (errorScores[correctAnswer]) {
      delete errorScores[correctAnswer];
      localStorage.setItem("errorScores", JSON.stringify(errorScores));
    }
  } else {
    hasAnsweredCorrectly = false;
    resultMessage.textContent = `Faux ! ❌ La réponse correcte est : ${correctAnswer}`;
    resultMessage.className = "incorrect";
    
    errorScores[correctAnswer] = (errorScores[correctAnswer] || 0) + 1;
    localStorage.setItem("errorScores", JSON.stringify(errorScores));
  }

  if (learningMode) {
    totalAttempts++;
    updateSuccessDisplay();
    
    const learningButtons = document.getElementById("learning-buttons");
    if (learningButtons) learningButtons.style.display = "flex";
    
    questionContainer.innerHTML += `<button onclick="nextLearningQuestion()">Question suivante ➡️</button>`;
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
  updateLearningPool();
  loadLearningQuestion();
}

// Marquer comme appris
function markAsLearned() {
  if (!hasAnsweredCorrectly) {
    const resultMessage = document.getElementById("result-message");
    resultMessage.textContent = "⚠️ Vous devez d'abord répondre correctement pour marquer ce dinosaure comme appris !";
    resultMessage.className = "incorrect";
    return;
  }
  
  knownImages.add(currentDinoName);
  localStorage.setItem("knownDinosaurs", JSON.stringify([...knownImages]));
  
  learningPool = learningPool.filter(d => d !== currentDinoName);
  
  if (errorScores[currentDinoName]) {
    delete errorScores[currentDinoName];
    localStorage.setItem("errorScores", JSON.stringify(errorScores));
  }
  
  updateLists();
  nextLearningQuestion();
}

// Skip une question
function skipQuestion() {
  skippedImages.add(currentDinoName);
  localStorage.setItem("skippedDinosaurs", JSON.stringify([...skippedImages]));
  
  learningPool = learningPool.filter(d => d !== currentDinoName);
  
  updateLists();
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
  if (confirm("Êtes-vous sûr de vouloir réinitialiser tous les progrès d'apprentissage ?")) {
    knownImages.clear();
    skippedImages.clear();
    errorScores = {};
    localStorage.removeItem("knownDinosaurs");
    localStorage.removeItem("skippedDinosaurs");
    localStorage.removeItem("errorScores");
    
    updateLists();
    
    if (learningMode) {
      startLearningMode();
    }
  }
}

// Initialisation au chargement de la page
window.addEventListener('load', () => {
  updateResponsiveLists();
  updateLists();
});

// Mise à jour responsive lors du redimensionnement
window.addEventListener('resize', () => {
  updateResponsiveLists();
});