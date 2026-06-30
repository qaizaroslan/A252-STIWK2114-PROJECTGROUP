<?php
require '../api/db.php';
header('Content-Type: application/json');

$stmt = $pdo->query('SELECT * FROM orders ORDER BY created_at DESC');
echo json_encode($stmt->fetchAll());
?>