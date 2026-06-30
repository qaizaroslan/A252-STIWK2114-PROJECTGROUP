<?php
require '../api/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $category = $_POST['category'];
    $desc = $_POST['desc'];
    $price = $_POST['price'];
    
    // Handle File Upload
    $imagePath = '';
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/';
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Generate unique filename
        $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "", basename($_FILES['photo']['name']));
        $targetFile = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $targetFile)) {
            $imagePath = 'uploads/' . $fileName; // Path to store in DB
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to upload image.']);
            exit;
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Image is required.']);
        exit;
    }

    // Insert into database
    $stmt = $pdo->prepare('INSERT INTO menu_items (name, category, description, price, image) VALUES (?, ?, ?, ?, ?)');
    if ($stmt->execute([$name, $category, $desc, $price, $imagePath])) {
        echo json_encode(['status' => 'success', 'message' => 'Item added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }
}
?>