<?php
try {
    // Connect to SQLite database
    $pdo = new PDO('sqlite:/home/smitefrawc/db-vgs/vgs.db');

    // Set error mode to exceptions
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // SQL query to select data from the table
    $sql = "SELECT name FROM gods";

    // Prepare and execute the SQL query
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    // Fetch all the results
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Display the results
    foreach ($results as $row) {
        print_r($row);
    }

} catch (PDOException $e) {
    // Handle any errors
    echo 'Connection failed: ' . $e->getMessage();
}

