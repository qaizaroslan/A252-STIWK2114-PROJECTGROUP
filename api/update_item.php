<?php
require '../api/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $name = $_POST['name'] ?? '';
    $category = $_POST['category'] ?? '';
    $desc = $_POST['desc'] ?? '';
    $price = $_POST['price'] ?? 0;
    
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'ID is required']);
        exit;
    }

    try {
        // Check if the user uploaded a NEW image
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            // Generate unique filename
            $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "", basename($_FILES['photo']['name']));
            $targetFile = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['photo']['tmp_name'], $targetFile)) {
                $imagePath = 'uploads/' . $fileName;
                
                // Update everything INCLUDING the image
                $stmt = $pdo->prepare('UPDATE menu_items SET name = ?, category = ?, description = ?, price = ?, image = ? WHERE id = ?');
                
                // ✅ CORRECT: Variables are wrapped in [ ]
                $result = $stmt->execute([$name, $category, $desc, $price, $imagePath, $id]); 
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to upload new image.']);
                exit;
            }
        } else {
            // Update ONLY text/price, keep the existing image
            $stmt = $pdo->prepare('UPDATE menu_items SET name = ?, category = ?, description = ?, price = ? WHERE id = ?');
            
            // ✅ CORRECT: Variables are wrapped in [ ]
            $result = $stmt->execute([$name, $category, $desc, $price, $id]);
        }

        if ($result) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update database.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>