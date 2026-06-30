<?php
require 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id)) {
    $stmt = $pdo->prepare('DELETE FROM orders WHERE id = ?');
    
    if ($stmt->execute([$data->id])) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
}
?>