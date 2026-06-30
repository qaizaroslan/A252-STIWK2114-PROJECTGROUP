<?php
require '../api/db.php';
header('Content-Type: application/json');

// Fetch the existing data
$stmt = $pdo->query("SELECT * FROM admin_users WHERE id = 1");
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Return as JSON
echo json_encode($user);
?>