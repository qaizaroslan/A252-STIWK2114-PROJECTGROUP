<?php
require 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));
if (isset($data->id) && isset($data->status)) {
    $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
    if ($stmt->execute([$data->status, $data->id])) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
}
?>