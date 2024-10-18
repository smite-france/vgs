<?php

$dir = './resources/';

// Vérifier si le répertoire existe
if (is_dir($dir)) {
    // Scanner le répertoire
    $files = scandir($dir);

    // Boucle pour parcourir les fichiers et dossiers
    foreach ($files as $file) {
        // Ignorer '.' et '..' qui sont des références au répertoire courant et parent
        if ($file != '.' && $file != '..') {
            // Vérifier si c'est un dossier
            if (is_dir($dir . '/' . $file)) {
                echo "Dossier trouvé : " . $file . "<br>";
            }
        }
    }
} else {
    echo "Le répertoire spécifié n'existe pas." . $dir;
}
?>
