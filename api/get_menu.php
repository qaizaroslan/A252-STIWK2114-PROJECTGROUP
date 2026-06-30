<?php
require '../api/db.php';
header('Content-Type: application/json');

$stmt = $pdo->query('SELECT * FROM menu_items ORDER BY created_at DESC');
$menuItems = $stmt->fetchAll();

echo json_encode($menuItems);
?>