const quizContainer = document.getElementById("quiz-container");
const modeSelection = document.getElementById("mode-selection");
const gameContainer = document.getElementById("game-container");
const courseContainer = document.getElementById("course-container");
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
let courseMode = false;
let knownImages = new Set(JSON.parse(localStorage.getItem("knownDinosaurs")) || []);
let skippedImages = new Set(JSON.parse(localStorage.getItem("skippedDinosaurs")) || []);
let learningPool = [];
let successes = 0;
let totalAttempts = 0;
let errorScores = JSON.parse(localStorage.getItem("errorScores")) || {};
let currentDinoName = "";
let hasAnsweredCorrectly = false;

// Données des cours
const courseData = {
  dynasties: {
    title: "Les Grandes Dynasties de Dinosaures",
    content: `
      <h4>🦕 Les Sauropodes (Jurassique-Crétacé)</h4>
      <p>Les plus grands animaux terrestres ayant jamais existé. Ces herbivores géants dominaient les paysages du Jurassique et du Crétacé avec leurs longs cous et leurs queues massives.</p>
      <p><strong>Représentants :</strong> Brontosaurus, Diplodocus, Brachiosaurus, Argentinosaurus</p>
      
      <h4>🦖 Les Théropodes (Trias-Crétacé)</h4>
      <p>La dynastie des prédateurs bipèdes, comprenant les plus féroces chasseurs de l'ère mésozoïque. Certains ont évolué pour devenir les oiseaux modernes.</p>
      <p><strong>Représentants :</strong> Tyrannosaurus, Allosaurus, Velociraptor, Carnotaurus</p>
      
      <h4>🛡️ Les Ornithischiens (Jurassique-Crétacé)</h4>
      <p>Les dinosaures "à bassin d'oiseau", principalement herbivores, développant des armures sophistiquées et des moyens de défense variés.</p>
      <p><strong>Représentants :</strong> Triceratops, Stegosaurus, Ankylosaurus, Parasaurolophus</p>
      
      <h4>🏃 Les Ornithomimidés (Crétacé)</h4>
      <p>Les "imitateurs d'oiseaux", dinosaures rapides et agiles, souvent omnivores, ressemblant aux autruches modernes.</p>
      <p><strong>Représentants :</strong> Gallimimus, Ornithomimus, Struthiomimus</p>
    `
  },
  extinctions: {
    title: "Les 5 Grandes Extinctions de Masse",
    content: `
      <h4>1️⃣ Extinction de l'Ordovicien-Silurien (445 Ma)</h4>
      <p><strong>Cause :</strong> Glaciation massive et chute du niveau des mers</p>
      <p><strong>Impact :</strong> 85% des espèces marines disparues</p>
      
      <h4>2️⃣ Extinction du Dévonien tardif (375 Ma)</h4>
      <p><strong>Cause :</strong> Appauvrissement en oxygène des océans</p>
      <p><strong>Impact :</strong> 75% des espèces disparues, surtout marines</p>
      
      <h4>3️⃣ Extinction Permien-Trias (252 Ma)</h4>
      <p><strong>Cause :</strong> Volcanisme massif en Sibérie, réchauffement global</p>
      <p><strong>Impact :</strong> "La Grande Mort" - 96% des espèces marines et 70% des espèces terrestres</p>
      
      <h4>4️⃣ Extinction Trias-Jurassique (201 Ma)</h4>
      <p><strong>Cause :</strong> Volcanisme et changements climatiques</p>
      <p><strong>Impact :</strong> 80% des espèces, permettant la domination des dinosaures</p>
      
      <h4>5️⃣ Extinction Crétacé-Paléogène (66 Ma)</h4>
      <p><strong>Cause :</strong> Impact d'astéroïde + volcanisme du Deccan</p>
      <p><strong>Impact :</strong> Fin des dinosaures non-aviaires, 75% des espèces</p>
      
      <p><em>🚨 Nous vivons actuellement la 6ème extinction de masse, causée par l'activité humaine.</em></p>
    `
  },
  timeline: {
    title: "Frise Chronologique des Dinosaures",
    content: `
      <div class="timeline-legend">
        <div class="legend-item">
          <div class="legend-color extinction"></div>
          <span>Extinctions</span>
        </div>
        <div class="legend-item">
          <div class="legend-color dynasty"></div>
          <span>Dynasties</span>
        </div>
        <div class="legend-item">
          <div class="legend-color formation"></div>
          <span>Formations géologiques</span>
        </div>
        <div class="legend-item">
          <div class="legend-color discovery"></div>
          <span>Découvertes</span>
        </div>
        <div class="legend-item">
          <div class="legend-color event"></div>
          <span>Événements majeurs</span>
        </div>
      </div>
      
      <div class="timeline">
        <div class="timeline-container">
          <div class="timeline-line"></div>
          
          <div class="timeline-event" style="left: 5%;" onclick="showTimelineInfo('permien')">
            <div class="timeline-marker extinction"></div>
            <div class="timeline-label">Permien-Trias</div>
            <div class="timeline-date">252 Ma</div>
          </div>
          
          <div class="timeline-event" style="left: 15%;" onclick="showTimelineInfo('premiers')">
            <div class="timeline-marker dynasty"></div>
            <div class="timeline-label">Premiers Dinosaures</div>
            <div class="timeline-date">230 Ma</div>
          </div>
          
          <div class="timeline-event" style="left: 25%;" onclick="showTimelineInfo('trias')">
            <div class="timeline-marker extinction"></div>
            <div class="timeline-label">Trias-Jurassique</div>
            <div class="timeline-date">201 Ma</div>
          </div>
          
          <div class="timeline-event" style="left: 35%;" onclick="showTimelineInfo('sauropodes')">
            <div class="timeline-marker dynasty"></div>
            <div class="timeline-label">Âge des Sauropodes</div>
            <div class="timeline-date">180 Ma</div>
          </div>
          
          <div class="timeline-event" style="left: 50%;" onclick="showTimelineInfo('theropodes')">
            <div class="timeline-marker dynasty"></div>
            <div class="timeline-label">Grands Théropodes</div>
            <div class="timeline-date">150 Ma</div>
          </div>
          
          <div class="timeline-event" style="left: 65%;" onclick="showTimelineInfo('diversification')">
            <div class="timeline-marker event"></div>
            <div class="timeline-label">Grande Diversification</div>
            <div class="timeline-date">100 Ma</div>
          </div>
          
          <div class="timeline-event" style="left: 80%;" onclick="showTimelineInfo('tyrannosaurus')">
            <div class="timeline-marker dynasty"></div>
            <div class="timeline-label">T-Rex et géants</div>
            <div class="timeline-date">70 Ma</div>
          </div>
          
          <div class="timeline-event" style="left: 95%;" onclick="showTimelineInfo('cretace')">
            <div class="timeline-marker extinction"></div>
            <div class="timeline-label">Crétacé-Paléogène</div>
            <div class="timeline-date">66 Ma</div>
          </div>
        </div>
      </div>
    `
  }
};

// Informations détaillées pour la timeline
const timelineInfo = {
  permien: "L'extinction Permien-Trias est la plus massive de tous les temps, éliminant 96% des espèces marines et ouvrant la voie aux dinosaures.",
  premiers: "Les premiers dinosaures apparaissent au Trias moyen, encore petits et peu diversifiés.",
  trias: "L'extinction Trias-Jurassique permet aux dinosaures de dominer les écosystèmes terrestres.",
  sauropodes: "Le Jurassique voit l'essor des sauropodes géants comme Diplodocus et Brachiosaurus.",
  theropodes: "Les grands prédateurs comme Allosaurus dominent le Jurassique supérieur.",
  diversification: "Le Crétacé est marqué par une explosion de diversité : tyrannosaures, hadrosaures, cératopsiens.",
  tyrannosaurus: "Les derniers géants comme T-Rex et Triceratops règnent à la fin du Crétacé.",
  cretace: "L'impact d'astéroïde met fin au règne des dinosaures non-aviaires."
};

// Gestion responsive des listes
function updateResponsiveLists() {
  const isMobile = window.innerWidth <= 1000;
  const desktopPanels = document.querySelectorAll('.main-container .side-panel');
  const mobilePanels = document.getElementById('mobile-panels');
  
  if (isMobile) {
    desktopPanels.forEach(panel => panel.style.display = 'none');
    mobilePanels.style.display = 'flex';
  } else {
    desktopPanels.forEach(panel => panel.style.display = 'block');
    mobilePanels.style.display = 'none';
  }
  
  updateLists();
}

// Mettre à jour les listes des dinosaures avec boutons de suppression
function updateLists() {
  const learnedArray = [...knownImages].sort();
  const skippedArray = [...skippedImages].sort();
  
  // Desktop
  updateListContent('learned-list', learnedArray, 'learned-item', true);
  updateListContent('skipped-list', skippedArray, 'skipped-item', false);
  document.getElementById('learned-counter').textContent = learnedArray.length;
  document.getElementById('skipped-counter').textContent = skippedArray.length;
  
  // Mobile
  updateListContent('learned-list-mobile', learnedArray, 'learned-item', true);
  updateListContent('skipped-list-mobile', skippedArray, 'skipped-item', false);
  document.getElementById('learned-counter-mobile').textContent = learnedArray.length;
  document.getElementById('skipped-counter-mobile').textContent = skippedArray.length;
}

function updateListContent(listId, items, itemClass, isLearned) {
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
    li.className = itemClass;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'dino-name';
    nameSpan.textContent = item;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.title = 'Supprimer de la liste';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeDinoFromList(item, isLearned);
    };
    
    li.appendChild(nameSpan);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

// Supprimer un dinosaure des listes
function removeDinoFromList(dinoName, fromLearned) {
  if (fromLearned) {
    knownImages.delete(dinoName);
    localStorage.setItem("knownDinosaurs", JSON.stringify([...knownImages]));
  } else {
    skippedImages.delete(dinoName);
    localStorage.setItem("skippedDinosaurs", JSON.stringify([...skippedImages]));
  }
  
  // Supprimer les erreurs associées
  if (errorScores[dinoName]) {
    delete errorScores[dinoName];
    localStorage.setItem("errorScores", JSON.stringify(errorScores));
  }
  
  updateLists();
  
  // Si on est en mode apprentissage, mettre à jour le pool
  if (learningMode) {
    updateLearningPool();
  }
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
  courseMode = false;
  modeSelection.style.display = "none";
  gameContainer.style.display = "block";
  courseContainer.style.display = "none";
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
  courseMode = false;
  modeSelection.style.display = "none";
  gameContainer.style.display = "block";
  courseContainer.style.display = "none";
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

// Démarrer le mode cours
function startCourseMode() {
  learningMode = false;
  courseMode = true;
  modeSelection.style.display = "none";
  gameContainer.style.display = "none";
  courseContainer.style.display = "block";
  document.getElementById("progress-container").style.display = "none";
  document.getElementById("course-nav").style.display = "none";
  resetButton.style.display = "none";
  
  showCourseMenu();
}

// Afficher le menu des cours
function showCourseMenu() {
  document.getElementById("course-nav").style.display = "none";
  document.getElementById("course-content").innerHTML = `
    <h2>📚 Cours sur les Dinosaures</h2>
    <p>Découvrez l'histoire fascinante des dinosaures à travers nos cours interactifs :</p>
    
    <div class="course-grid">
      <div class="course-card" onclick="showCourse('dynasties')">
        <h3>🦕 Les Grandes Dynasties</h3>
        <p>Découvrez les principales familles de dinosaures et leurs caractéristiques uniques.</p>
      </div>
      
      <div class="course-card" onclick="showCourse('extinctions')">
        <h3>💥 Les 5 Grandes Extinctions</h3>
        <p>Explorez les catastrophes qui ont façonné l'évolution de la vie sur Terre.</p>
      </div>
      
      <div class="course-card" onclick="showCourse('timeline')">
        <h3>⏰ Frise Chronologique</h3>
        <p>Voyagez dans le temps avec notre timeline interactive des événements majeurs.</p>
      </div>
    </div>
  `;
}

// Afficher un cours spécifique
function showCourse(courseId) {
  const course = courseData[courseId];
  if (!course) return;
  
  document.getElementById("course-nav").style.display = "flex";
  document.getElementById("current-course-title").textContent = course.title;
  
  document.getElementById("course-content").innerHTML = `
    <div class="course-content">
      ${course.content}
    </div>
  `;
}

// Retour au menu des cours
function backToCourseMenu() {
  showCourseMenu();
}

// Afficher des informations sur un événement de la timeline
function showTimelineInfo(eventId) {
  const info = timelineInfo[eventId];
  if (info) {
    alert(info);
  }
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
  courseContainer.style.display = "none";
  questionContainer.innerHTML = "";
  usedImages = [];
  document.getElementById("progress-container").style.display = "block";
  resetButton.style.display = "none";
}

// Recommencer le mode apprentissage
function restartLearning() {
  modeSelection.style.display = "block";
  gameContainer.style.display = "none";
  courseContainer.style.display = "none";
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