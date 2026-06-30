<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));
$userMessage = $data->message ?? '';

if (!$userMessage) {
    echo json_encode(['reply' => 'Please provide a message.']);
    exit;
}

$apiKey = "AQ.Ab8RN6KzoRkVyFaWO2z-STX58LXTtzerMGu135nyg2mYNjDQNQ";

// Define your automatic model hierarchy
$primaryModel = "gemini-2.5-flash"; // Fast and cheap
$backupModel = "gemini-2.5-pro";    // Smarter fallback

$businessContext = "
Restaurant Name: Ayam Gepuk AiQu
Business Type: Restaurant
Products: Ayam Gepuk, Drinks, Desserts
Currency: MYR
";

$summary = "
Business Summary
Total Revenue : RM 18,250
Total Orders : 215
Best Seller : Ayam Gepuk Original
Pending Orders : 5
Completed Orders : 205
Cancelled Orders : 5
";

$postData = [
    "systemInstruction" => [
        "parts" => [
            ["text" => "You are AiQu Business Intelligence Assistant. Keep answers professional and concise."]
        ]
    ],
    "contents" => [
        [
            "parts" => [
                ["text" => $businessContext . $summary . "\n\nUser Question:\n" . $userMessage]
            ]
        ]
    ]
];

// Create a reusable function to call Google
function callGeminiAPI($model, $apiKey, $postData) {
    $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" . $model . ":generateContent?key=" . $apiKey;
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [$httpCode, $response];
}

// 1. Try the primary model first
list($httpCode, $response) = callGeminiAPI($primaryModel, $apiKey, $postData);

// 2. Automatically change to backup if the primary fails
if ($httpCode != 200) {
    list($httpCode, $response) = callGeminiAPI($backupModel, $apiKey, $postData);
}

// 3. Process the final result
if ($httpCode == 200) {
    $result = json_decode($response, true);
    $aiReply = $result['candidates'][0]['content']['parts'][0]['text'] ?? "Sorry, I received an empty response.";
    echo json_encode(['reply' => trim($aiReply)]);
} else {
    $errorResult = json_decode($response, true);
    $errorMessage = $errorResult['error']['message'] ?? "Both models failed.";
    echo json_encode(['reply' => "System Error: " . $errorMessage]);
}
?>
