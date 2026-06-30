document.addEventListener('DOMContentLoaded', () => {
    const menuGrid = document.getElementById('menuGrid');
    const totalCount = document.getElementById('totalCount');
    const searchInput = document.getElementById('searchInput');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    let menuDatabase = [];
    let currentCategory = 'All';
    let searchQuery = '';

    // Fetch data from PHP
    function fetchMenus() {
        fetch('api/get_menu.php')
            .then(response => response.json())
            .then(data => {
                menuDatabase = data;
                renderMenus();
            })
            .catch(error => console.error('Error fetching menu:', error));
    }

    function renderMenus() {
        const filteredData = menuDatabase.filter(item => {
            const matchesCategory = currentCategory === 'All' || item.category === currentCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        totalCount.textContent = `Total Item: ${filteredData.length}`;

        if (filteredData.length === 0) {
            menuGrid.innerHTML = `<p class="text-gray-500 text-sm col-span-2 text-center py-4">No items found.</p>`;
            return;
        }

        menuGrid.innerHTML = filteredData.map(item => `
            <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative group overflow-hidden">
                
                <button data-id="${item.id}" class="edit-btn absolute top-4 right-12 bg-blue-100 text-blue-600 h-7 w-7 rounded-full flex items-center justify-center hover:bg-blue-200 z-10 shadow-sm cursor-pointer">
                    <i class="fa-solid fa-pen text-xs pointer-events-none"></i>
                </button>
                
                <button data-id="${item.id}" class="delete-btn absolute top-4 right-3 bg-red-100 text-red-600 h-7 w-7 rounded-full flex items-center justify-center hover:bg-red-200 z-10 shadow-sm cursor-pointer">
                    <i class="fa-solid fa-trash text-xs pointer-events-none"></i>
                </button>

                <img src="${item.image}" alt="${item.name}" class="w-full h-28 object-cover rounded-lg mb-2">
                <h3 class="font-bold text-sm pr-1 truncate">${item.name}</h3>
                <p class="text-indigo-600 font-semibold text-sm">RM${parseFloat(item.price).toFixed(2)}</p>
                <p class="text-[10px] text-gray-400 mt-1 line-clamp-2">${item.description}</p>
            </div>
        `).join('');
    }

    // Handle Clicks on Edit and Delete buttons inside the grid
    menuGrid.addEventListener('click', (e) => {
        // DELETE LOGIC
        if (e.target.classList.contains('delete-btn')) {
            if(!confirm('Are you sure you want to delete this item?')) return;
            const idToDelete = e.target.getAttribute('data-id');

            fetch(`api/delete_item.php?id=${idToDelete}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if(data.status === 'success') {
                        fetchMenus(); 
                    } else {
                        alert('Failed to delete item.');
                    }
                });
        }
        
        // EDIT LOGIC
        if (e.target.classList.contains('edit-btn')) {
            const idToEdit = e.target.getAttribute('data-id');
            // Find the item details from our array
            const item = menuDatabase.find(m => m.id == idToEdit);
            if (item) {
                openEditModal(item);
            }
        }
    });

// --- EDIT MODAL FUNCTIONS ---
    window.openEditModal = function(item) {
        document.getElementById('edit_id').value = item.id;
        document.getElementById('edit_name').value = item.name;
        document.getElementById('edit_category').value = item.category;
        document.getElementById('edit_desc').value = item.description;
        document.getElementById('edit_price').value = item.price;
        
        // Reset file inputs and text when opening
        document.getElementById('edit_photo_cam').value = '';
        document.getElementById('edit_photo_folder').value = '';
        document.getElementById('file-chosen-text').classList.add('hidden');
        
        document.getElementById('editItemModal').classList.remove('hidden');
    };

    window.closeEditModal = function() {
        document.getElementById('editItemModal').classList.add('hidden');
        document.getElementById('editItemForm').reset();
    };

    // Added the missing function to show the selected file name
    window.updateFileName = function(input) {
        const fileText = document.getElementById('file-chosen-text');
        if (input.files && input.files.length > 0) {
            fileText.textContent = "Selected: " + input.files[0].name;
            fileText.classList.remove('hidden');
        } else {
            fileText.classList.add('hidden');
        }
    };

    window.updateFileName = function(input) {
        const fileText = document.getElementById('file-chosen-text');
        if (input.files && input.files.length > 0) {
            fileText.textContent = "Selected: " + input.files[0].name;
            fileText.classList.remove('hidden');
        }
    };

    window.submitEditItem = function(event) {
    event.preventDefault(); // Crucial: Stop the page from reloading
    
    const form = document.getElementById('editItemForm');
    const formData = new FormData(form); // Automatically grabs all inputs by 'name' attribute
    
    // NOTE: Ensure your HTML inputs have 'name' attributes matching 
    // the expected keys in PHP (id, name, category, desc, price).
    // If not, explicitly append them:
    formData.set('id', document.getElementById('edit_id').value);
    formData.set('name', document.getElementById('edit_name').value);
    formData.set('category', document.getElementById('edit_category').value);
    formData.set('desc', document.getElementById('edit_desc').value);
    formData.set('price', document.getElementById('edit_price').value);

    // Handle Image inputs
    const photoCam = document.getElementById('edit_photo_cam');
    const photoFolder = document.getElementById('edit_photo_folder');
    
    if (photoCam && photoCam.files.length > 0) {
        formData.set('photo', photoCam.files[0]);
    } else if (photoFolder && photoFolder.files.length > 0) {
        formData.set('photo', photoFolder.files[0]);
    }

    fetch('api/update_item.php', {
        method: 'POST',
        body: formData 
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            alert('Update successful!');
            closeEditModal();
            fetchMenus(); // Refresh the grid
        } else {
            alert('Failed to update: ' + data.message);
        }
    })
    .catch(err => {
        console.error("Update Error: ", err);
        alert('Check console for error details.');
    });
    };

    // Category Tabs Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => {
                b.classList.remove('border-b-2', 'border-gray-900', 'font-bold', 'text-gray-900');
                b.classList.add('text-gray-400', 'font-medium');
            });
            const clickedTab = e.target;
            clickedTab.classList.remove('text-gray-400', 'font-medium');
            clickedTab.classList.add('border-b-2', 'border-gray-900', 'font-bold', 'text-gray-900');
            
            currentCategory = clickedTab.dataset.category;
            renderMenus();
        });
    });

    // Search Logic
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderMenus();
    });

    // Startup
    fetchMenus();
});