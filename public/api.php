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
            $stmt = $pdo->prepare("SELECT gods.id AS god_id, gods.name AS god_name, skins.name AS skin_name, skins.id AS skin_id FROM gods LEFT JOIN skins ON gods.id = skins.id_god");
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $godsWithSkins = [];

            foreach ($results as $row) {
                $godName = $row['god_name'];
                $skinName = $row['skin_name'];
                $godId = $row['god_id'];
                $skinId = $row['skin_id'];

                $foundIndex = null;
                foreach ($godsWithSkins as $index => $god) {
                    if ($god['id'] === $godId) {
                        $foundIndex = $index;
                        break;
                    }
                }

                if ($foundIndex === null) {
                    $godsWithSkins[] = [
                        'id' => $godId,
                        'name' => $godName,
                        'skins' => []
                    ];
                    $foundIndex = count($godsWithSkins) - 1;
                }

                if (!is_null($skinId)) {
                    $godsWithSkins[$foundIndex]['skins'][] = [
                        'id' => $skinId,
                        'name' => $skinName
                    ];
                }
            }

            echo json_encode($godsWithSkins);
            exit;

        case 'god':
            switch ($m) {
                case 'vgs':
                    $godName = $_GET['god'] ?? null;
                    $skinName = $_GET['skin'] ?? null;

                    if (empty($godName) || empty($skinName)) {
                        http_response_code(400);
                        echo json_encode(['error' => '"god" and "skin" parameters are required.']);
                        exit;
                    }

                    $stmt = $pdo->prepare("SELECT DISTINCT vgs.name AS vgs_name FROM vgs JOIN skins ON vgs.id_skin = skins.id JOIN gods ON skins.id_god = gods.id WHERE gods.name = :god_name AND skins.name = :skin_name;");

                    $stmt->execute([
                        ':god_name' => $godName,
                        ':skin_name' => $skinName
                    ]);
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

