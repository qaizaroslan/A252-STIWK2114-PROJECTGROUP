<?php
require '../api/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $stmt = $pdo->prepare('DELETE FROM menu_items WHERE id = ?');
        if ($stmt->execute([$id])) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Could not delete from database.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No ID provided.']);
    }
}
?>