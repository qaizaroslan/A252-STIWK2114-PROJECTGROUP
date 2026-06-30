<?php
require 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));

if (isset($data->customer_name) && isset($data->product_name) && isset($data->qty) && isset($data->total_price) && isset($data->payment_method)) {
    $stmt = $pdo->prepare('INSERT INTO orders (customer_name, product_name, qty, total_price, payment_method, status) VALUES (?, ?, ?, ?, ?, "Pending")');
    
    if ($stmt->execute([$data->customer_name, $data->product_name, $data->qty, $data->total_price, $data->payment_method])) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing data']);
}
?>