<?php
require '../api/db.php';
header('Content-Type: application/json');

try {
    // Total Menu Items
    $totalMenu = $pdo->query("SELECT COUNT(*) FROM menu_items")->fetchColumn();
    
    // Total Orders
    $totalOrders = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
    
    // Total Staff (assuming a staff/users table exists - fallback to 0 if not)
    try {
        $totalStaff = $pdo->query("SELECT total_staff FROM admin_users")->fetchColumn();
    } catch (Exception $e) {
        $totalStaff = 0; 
    }
    
    // Total Revenue (Only summing up 'Complete' orders)
    $totalRevenue = $pdo->query("SELECT SUM(total_price) FROM orders WHERE status = 'Complete'")->fetchColumn();
    $totalRevenue = $totalRevenue ? (float)$totalRevenue : 0.00;

    echo json_encode([
        'success' => true,
        'totalMenu' => $totalMenu,
        'totalOrders' => $totalOrders,
        'totalStaff' => $totalStaff,
        'totalRevenue' => number_format($totalRevenue, 2)
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>