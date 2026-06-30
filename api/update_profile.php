<?php
require '../api/db.php';
header('Content-Type: application/json');

try {
    // 1. Prepare the update query
    $sql = "UPDATE admin_users SET 
            restaurant_name = :name, 
            email = :email, 
            phone_number = :phone, 
            total_staff = :staff, 
            address = :address, 
            city = :city, 
            postal_code = :zip, 
            state = :state";
            
    $params = [
        ':name' => $_POST['restaurantName'],
        ':email' => $_POST['email'],
        ':phone' => $_POST['phoneNum'],
        ':staff' => $_POST['staff'],
        ':address' => $_POST['address'],
        ':city' => $_POST['city'],
        ':zip' => $_POST['postalCode'],
        ':state' => $_POST['state']
    ];

    // 2. Handle image update if a new file is uploaded
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/';
        $filename = 'user_1_' . time() . '.' . pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION);
        if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $uploadDir . $filename)) {
            $sql .= ", profile_image = :img";
            $params[':img'] = $filename;
        }
    }

    $sql .= " WHERE id = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['status' => 'success', 'message' => 'Details updated!']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>