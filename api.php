<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // for dev purpose

$c = $_GET['c'] ?? null;
$m = $_GET['m'] ?? null;

try {
    $pdo = new PDO('sqlite:/home/smitefrawc/db-vgs/vgs.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    switch ($c) {
        case 'gods':
            $stmt = $pdo->prepare("SELECT name FROM gods") ;
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($results) {
                echo json_encode($results);
            } else {
                echo json_encode([]);
            }
            exit;

        case 'skins':
            http_response_code(404);
            echo json_encode([
                'error' => 'TODO'
            ]);
            exit;

        case 'vgs':
            http_response_code(404);
            echo json_encode([
                'error' => 'TODO'
            ]);
            exit;

        default:
            http_response_code(404);
            echo json_encode([
                'error' => '"c" params required.'
            ]);
            exit;
    }

} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
}

