//A executer lors de l'ajout d'images dans le dossier dinos
//Executer la commande suivante dans le terminal:
//node generate-dino-list.js
//Cela générera le fichier dino-list.js avec la liste des dinosaures

const fs = require("fs");
const path = require("path");

const dinosDir = "./dinos";
const outputFile = "./dino-list.js";

// Lire les fichiers dans le dossier dinos
fs.readdir(dinosDir, (err, files) => {
  if (err) {
    console.error("Erreur de lecture du dossier :", err);
    return;
  }

  // Filtrer les fichiers JPG et enlever l'extension .jpg
  const dinoNames = files
    .filter((file) => file.toLowerCase().endsWith(".jpg"))
    .map((file) => file.replace(/\.jpg$/i, ""));

  // Générer le contenu du fichier dino-list.js
  const content = `const dinosaurImages = [\n  "${dinoNames.join('",\n  "')}"\n];\n`;

  // Écrire dans dino-list.js
  fs.writeFile(outputFile, content, (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture du fichier :", err);
      return;
    }
    console.log(`Fichier ${outputFile} généré avec ${dinoNames.length} dinosaures.`);
  });
});