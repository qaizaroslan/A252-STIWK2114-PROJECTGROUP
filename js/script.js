document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Stats
    function loadDashboardStats() {
        // FIX: Replaced hyphens with underscores to match file name
        fetch('api/get_dashboard_stats.php')
            .then(response => response.json())
            .then(data => {
                if(data.success){
                    document.getElementById('stat-menu').textContent = data.totalMenu;
                    document.getElementById('stat-orders').textContent = data.totalOrders;
                    document.getElementById('stat-staff').textContent = data.totalStaff;
                    // FIX: Appended .totalRevenue to data
                    document.getElementById('stat-revenue').textContent = data.totalRevenue;
                }
            });
    }

    // FIX: Actually execute the function on load
    loadDashboardStats();

    // 2. Load Charts
    fetch('api/get_chart_data.php')
        .then(res => res.json())
        .then(data => {
            // Best Selling Bar Chart
            const ctxBar = document.getElementById('orderBarChart');
            new Chart(ctxBar, {
                type: 'bar',
                data: {
                    // FIX: Changed menu_name to product_name to match PHP
                    labels: data.bestSelling.map(item => item.product_name),
                    datasets: [{
                        label: 'Total Sold',
                        data: data.bestSelling.map(item => item.total_sold),
                        backgroundColor: '#dc2626'
                    }]
                }
            });

            // Doughnut / Overview Data 
            // FIX: Bind the PHP data to the DOM elements
            if(data.success && data.doughnut) {
                document.getElementById('completeLabel').textContent = (data.doughnut.Complete || 0) + '%';
                document.getElementById('pendingLabel').textContent = (data.doughnut.Pending || 0) + '%';
                // Note: using cancelLAbel exactly as typed in your HTML ID
                document.getElementById('cancelLAbel').textContent = (data.doughnut.Cancel || 0) + '%';
            }
        });

    // AI Chat Input Listener
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') window.sendChatMessage();
        });
    }

// ==========================================
// AI CHAT WIDGET LOGIC
// ==========================================
window.toggleAiChat = function() {
    const chatBox = document.getElementById('aiChatBox');
    if(chatBox) chatBox.classList.toggle('hidden');
};

window.sendChatMessage = function() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `
        <div class="bg-red-600 text-white text-xs p-3 rounded-2xl rounded-tr-none self-end max-w-[85%] shadow-sm mt-2 leading-relaxed">
            ${message}
        </div>
    `;
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Show "thinking" state
    const loadingId = 'loading-' + Date.now();
    chatMessages.innerHTML += `<div id="${loadingId}" class="text-gray-400 text-xs p-2">AiQu is thinking...</div>`;

    fetch('api/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById(loadingId)?.remove();

        const reply = document.createElement("div");

        reply.className =
            "bg-white border border-gray-200 text-gray-800 text-xs p-3 rounded-2xl rounded-tl-none self-start max-w-[85%] shadow-sm mt-2 leading-relaxed";

        reply.innerHTML = marked.parse(data.reply);

        chatMessages.appendChild(reply);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
};
});