document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('ordersContainer');
    const tabs = document.querySelectorAll('#orderTabs button');
    const productSelect = document.getElementById('product_name');

    let allOrders = [];
    let currentFilter = 'All';
    let searchQuery = '';
    
    // NEW: Array to hold multiple items for a single order
    let orderCart = [];

    // --- 1. Fetch and Render Database Orders ---
    function fetchOrders() {
        fetch('api/get_orders.php')
            .then(res => res.json())
            .then(data => {
                allOrders = data;
                renderOrders();
            })
            .catch(err => console.error("Error fetching orders:", err));
    }

    // --- 1. Modify the filtering logic in renderOrders ---
    function renderOrders() {
    const filtered = allOrders.filter(order => {
    const matchesStatus = (currentFilter === 'All' || order.status === currentFilter);
        
        // Check if the search query exists in any of the three fields
        const matchesSearch = (
            order.customer_name.toLowerCase().includes(searchQuery) ||
            order.product_name.toLowerCase().includes(searchQuery) ||
            order.payment_method.toLowerCase().includes(searchQuery)
        );
        
        return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
        ordersContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">No orders found.</p>';
        return;
    }

        ordersContainer.innerHTML = filtered.map(order => {
            let badgeClass = order.status === 'Complete' ? 'bg-green-100 text-green-700' :
                             order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                             'bg-red-100 text-red-700';
            let btnState = order.status !== 'Pending' ? 'cursor-not-allowed opacity-50' : '';
            
            return `
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                <div class="flex justify-between items-start mb-3">
                    <span class="text-xs font-bold text-gray-500">ID: #${order.id}</span>
                    <span class="px-2.5 py-1 ${badgeClass} rounded-md text-[10px] font-bold uppercase">${order.status}</span>
                </div>

                <div class="flex justify-between items-center mb-3 border-b border-gray-50 pb-3">
                    <div class="w-full">
                        <h3 class="font-bold text-sm text-gray-900">${order.customer_name}</h3>
                        <p class="text-xs text-gray-700 mt-1 leading-relaxed">${order.product_name}</p>
                    </div>
                </div>
                
                <div class="flex justify-between items-center pt-1">
                    <span class="font-bold text-lg text-gray-900">RM${parseFloat(order.total_price).toFixed(2)}</span>
                    <div class="flex gap-2">
                        <button onclick="updateOrderStatus(${order.id}, 'Complete')" class="px-2.5 py-1.5 bg-green-100 text-green-700 rounded-md text-[10px] font-bold uppercase ${btnState}">Complete</button>
                        <button onclick="updateOrderStatus(${order.id}, 'Cancel')" class="px-2.5 py-1.5 bg-yellow-100 text-yellow-700 rounded-md text-[10px] font-bold uppercase ${btnState}">Cancel</button>
                        <button onclick="deleteOrder(${order.id})" class="px-2.5 py-1.5 bg-red-100 text-red-700 rounded-md text-[10px] font-bold uppercase hover:bg-red-200"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // --- 2. Action Buttons ---
    window.updateOrderStatus = function(id, status) {
        fetch('api/update_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') fetchOrders();
        });
    };

    window.deleteOrder = function(id) {
        if(confirm('Are you sure you want to permanently delete this order?')) {
            fetch('api/delete_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') fetchOrders();
            });
        }
    };

    // --- 3. MULTI-ITEM CART LOGIC ---
    function fetchMenusForDropdown() {
        fetch('api/get_menu.php')
            .then(res => res.json())
            .then(data => {
                productSelect.innerHTML = '<option value="" data-price="0">Select a product...</option>';
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.name; 
                    option.dataset.price = item.price; 
                    option.textContent = `${item.name} - RM${parseFloat(item.price).toFixed(2)}`;
                    productSelect.appendChild(option);
                });
            });
    }

    // Add selected item to the order array
    window.addToOrderList = function() {
        const qtyInput = document.getElementById('item_qty');
        
        if (!productSelect.value) {
            alert("Please select a product first.");
            return;
        }

        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const name = selectedOption.value;
        const price = parseFloat(selectedOption.dataset.price);
        const qty = parseInt(qtyInput.value) || 1;

        // Check if item already exists in cart, if yes just increase qty
        const existingItem = orderCart.find(item => item.name === name);
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            orderCart.push({ name, price, qty });
        }

        // Reset inputs
        productSelect.value = '';
        qtyInput.value = '1';

        // Update the UI
        renderCartUI();
    };

    // Remove an item from the cart array
    window.removeCartItem = function(index) {
        orderCart.splice(index, 1);
        renderCartUI();
    };

    // Draw the cart HTML and calculate total
    function renderCartUI() {
        const listContainer = document.getElementById('orderItemsList');
        const totalQtyInput = document.getElementById('total_qty');
        const totalPriceInput = document.getElementById('total_price');

        let totalQty = 0;
        let grandTotal = 0;

        if (orderCart.length === 0) {
            listContainer.innerHTML = '<p class="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">No items added yet.</p>';
            totalQtyInput.value = '0';
            totalPriceInput.value = '0.00';
            return;
        }

        listContainer.innerHTML = orderCart.map((item, index) => {
            totalQty += item.qty;
            const subtotal = item.price * item.qty;
            grandTotal += subtotal;

            return `
                <li class="flex justify-between items-center bg-white border border-gray-100 p-2.5 rounded-lg shadow-sm">
                    <div>
                        <div class="font-bold text-gray-800 text-xs">${item.name}</div>
                        <div class="text-[10px] text-gray-500">RM${item.price.toFixed(2)} x ${item.qty}</div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="font-bold text-gray-900 text-sm">RM${subtotal.toFixed(2)}</span>
                        <button type="button" onclick="removeCartItem(${index})" class="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-md"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </li>
            `;
        }).join('');

        totalQtyInput.value = totalQty;
        totalPriceInput.value = grandTotal.toFixed(2);
    }

    // --- 4. Modal Logic ---
    window.openAddModal = function() {
        document.getElementById('addOrderModal').classList.remove('hidden');
        renderCartUI(); // draw empty state
    };

    window.closeAddModal = function() {
        document.getElementById('addOrderModal').classList.add('hidden');
        document.getElementById('addOrderForm').reset();
        orderCart = []; // clear the cart array
        renderCartUI(); 
    };

    window.submitNewOrder = function(event) {
        event.preventDefault(); 
        
        if (orderCart.length === 0) {
            alert("Please add at least one item to the cart.");
            return;
        }

        // Combine items into a single string for the database (e.g. "1x Set A, 2x Milo")
        const combinedProductName = orderCart.map(item => `${item.qty}x ${item.name}`).join(', ');

        const orderData = {
            customer_name: document.getElementById('customer_name').value,
            product_name: combinedProductName, // Sending the combined string
            qty: document.getElementById('total_qty').value,
            total_price: document.getElementById('total_price').value,
            payment_method: document.getElementById('payment_method').value
        };

        fetch('api/add_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                closeAddModal();
                fetchOrders(); 
            } else {
                alert('Failed to add order.');
            }
        });
    };

    // --- 5. Tabs Logic ---
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.className = "pb-2 text-gray-400 font-medium whitespace-nowrap text-sm");
            e.target.className = "pb-2 border-b-2 border-gray-900 font-bold text-gray-900 whitespace-nowrap text-sm";
            currentFilter = e.target.innerText;
            renderOrders();
        });
    });

    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderOrders();
    });

    // Run on startup
    fetchOrders();
    fetchMenusForDropdown();
});