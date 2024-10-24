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
            switch ($m) {
                case 'all':
                default:
                    $stmt = $pdo->prepare("SELECT id, name FROM gods");
                    $stmt->execute();
                    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    echo json_encode($results);
                    exit;
            }

        case 'skins':
            switch ($m) {
                case 'all':
                default:
                    $stmt = $pdo->prepare("SELECT id, id_god, name FROM skins");
                    $stmt->execute();
                    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    echo json_encode($results);
                    exit;
            }
        case 'vgs':
            switch ($m) {
                case 'sound':
                    $stmt = $pdo->prepare("SELECT id, id_god, name FROM vgs");
                    $stmt->execute();
                    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    echo json_encode($results);
                    exit;
                default:
                    http_response_code(404);
                    echo json_encode([
                        'error' => '"m" params required.'
                    ]);
                    exit;
            }
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

