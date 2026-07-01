document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addItemForm');

    // Show visual feedback when a file/photo is taken
    window.updateAddFileName = function(input) {
        const textElement = document.getElementById('add-file-chosen-text');
        
        // Prevent conflict: If camera is used, clear the folder input (and vice versa)
        if (input.id === 'photo_cam') {
            document.getElementById('photo_folder').value = '';
        } else {
            document.getElementById('photo_cam').value = '';
        }
        
        if (input.files && input.files.length > 0) {
            textElement.innerHTML = `<i class="fa-solid fa-check-circle mr-1"></i> Image Selected`;
            textElement.classList.remove('hidden');
        } else {
            textElement.classList.add('hidden');
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const camInput = document.getElementById('photo_cam');
        const folderInput = document.getElementById('photo_folder');
        
        // Find which input has the file and append it as 'photo' for PHP
        if (camInput.files.length > 0) {
            formData.append('photo', camInput.files[0]);
        } else if (folderInput.files.length > 0) {
            formData.append('photo', folderInput.files[0]);
        } else {
            alert("Please upload a photo using the Camera or Folder.");
            return;
        }

        fetch('../api/add_item.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                window.location.href = 'menu.html'; // Go back to menu
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(err => console.error("Error adding item:", err));
    });
});