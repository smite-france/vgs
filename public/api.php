<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // for dev purpose

$c = $_GET['c'] ?? null;
$m = $_GET['m'] ?? null;

try {
    $pdo = new PDO('sqlite:/home/smitefrawc/db-vgs/vgs.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($c === null) {
        http_response_code(400);
        echo json_encode(['error' => '"c" parameter is required.']);
        exit;
    }

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
                    $id_skin = $_GET['id_skin'] ?? null;
                    $name = $_GET['name'] ?? null;

                    if (empty($id_skin)) {
                        http_response_code(400);
                        echo json_encode(['error' => '"id_skin" parameter is required.']);
                        exit;
                    }

                    if (empty($name)) {
                        http_response_code(400);
                        echo json_encode(['error' => '"name" parameter is required.']);
                        exit;
                    }

                    $stmt = $pdo->prepare("SELECT name, url
FROM vgs
WHERE (id_skin = :id_skin AND name = :name)
   OR (id_skin IN (SELECT id FROM skins WHERE id_god = (SELECT id_god FROM skins WHERE id = :id_skin) AND LOWER(name) LIKE '%standard%') AND name = :name)
   OR (id_skin IN (SELECT id FROM skins WHERE LOWER(name) = 'default') AND name = :name)
ORDER BY
    CASE
        WHEN id_skin = :id_skin THEN 1
        WHEN id_skin IN (SELECT id FROM skins WHERE id_god = (SELECT id_god FROM skins WHERE id = :id_skin) AND LOWER(name) LIKE '%standard%') THEN 2
        WHEN id_skin IN (SELECT id FROM skins WHERE LOWER(name) = 'default') THEN 3
        END,
    RANDOM()
LIMIT 1;
");
                    $stmt->bindParam(':name', $name);
                    $stmt->bindParam(':id_skin', $id_skin);
                    $stmt->execute();
                    $result = $stmt->fetch(PDO::FETCH_ASSOC);

                    echo json_encode($result);
                    exit;
            }
        default:
            http_response_code(404);
            echo json_encode([
                'error' => '"c" not found.'
            ]);
            exit;
    }

} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
}

