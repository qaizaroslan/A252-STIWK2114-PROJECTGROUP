<?php
require 'api/db.php';
header('Content-Type: application/json');

try {
    // 1. Best Selling (Parsing multi-item strings like "1x Item A, 2x Item B")
    $stmt = $pdo->query("SELECT product_name FROM orders WHERE status = 'Complete'");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $itemCounts = [];
    foreach ($orders as $order) {
        $items = explode(',', $order['product_name']);
        foreach ($items as $itemStr) {
            $itemStr = trim($itemStr);
            
            if (preg_match('/^(\d+)x\s+(.+)$/', $itemStr, $matches)) {
                $qty = (int)$matches[1];
                $name = trim($matches[2]);
                $itemCounts[$name] = ($itemCounts[$name] ?? 0) + $qty;
            }
        }
    }
    
    arsort($itemCounts); // Sort descending
    
    $bestSelling = [];
    $limit = 0;
    foreach ($itemCounts as $name => $count) {
        if ($limit >= 5) break;
        $bestSelling[] = ['product_name' => $name, 'total_sold' => $count];
        $limit++;
    }
    
    // Fallback if no sales yet (shows empty chart instead of breaking)
    if (empty($bestSelling)) {
        $menuItems = $pdo->query("SELECT name FROM menu_items LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($menuItems as $menu) {
            $bestSelling[] = ['product_name' => $menu['name'], 'total_sold' => 0];
        }
    }

    // 2. Order Status Overview
    $totalOrders = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
    $totalOrders = max((int)$totalOrders, 1); // Prevent division by zero

    // Must match the exact status names used in orders.js
    $statuses = ['Complete', 'Pending', 'Cancel'];
    $doughnutData = [];

    foreach ($statuses as $status) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE status = ?");
        $stmt->execute([$status]);
        $count = $stmt->fetchColumn();
        $doughnutData[$status] = round(($count / $totalOrders) * 100, 1);
    }

    echo json_encode([
        'success' => true,
        'bestSelling' => $bestSelling,
        'doughnut' => $doughnutData
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>