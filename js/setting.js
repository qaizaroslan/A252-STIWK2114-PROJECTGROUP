document.addEventListener('DOMContentLoaded', function() {
    // This function runs automatically every time the page is opened
    fetch('api/get_profile.php')
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Populate the textfields with database data
                document.getElementById('restaurantName').value = data.restaurant_name || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('phoneNum').value = data.phone_number || '';
                document.getElementById('staff').value = data.total_staff || '';
                document.getElementById('address').value = data.address || '';
                document.getElementById('city').value = data.city || '';
                document.getElementById('postalCode').value = data.postal_code || '';
                document.getElementById('state').value = data.state || '';
                
                // Display the profile image if it exists
                if (data.profile_image) {
                    document.getElementById('profilePreview').src = 'uploads/' + data.profile_image;
                }
            }
        })
        .catch(error => console.error('Error loading profile:', error));
    
    document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Stop page refresh
    
    const formData = new FormData(this);
    const alertBox = document.getElementById('statusAlert');

    fetch('api/update_profile.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            alertBox.textContent = "Profile updated successfully!";
            alertBox.className = "p-3 mb-4 rounded text-sm font-medium bg-green-100 text-green-700";
            alertBox.classList.remove('hidden');
        } else {
            alertBox.textContent = "Error: " + data.message;
            alertBox.className = "p-3 mb-4 rounded text-sm font-medium bg-red-100 text-red-700";
            alertBox.classList.remove('hidden');
        }
    })
    .catch(err => console.error(err));
});
const form = document.getElementById('profileForm');
const confirmBtn = document.getElementById('confirmBtn');

document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Stop page refresh
    
    const formData = new FormData(this);
    const alertBox = document.getElementById('statusAlert');

    fetch('api/update_profile.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            // Set success message
            alertBox.textContent = "Your profile is successfully updated!";
            alertBox.className = "p-3 mb-4 rounded text-sm font-medium bg-green-100 text-green-700 block transition-all duration-300";
            
            // Scroll to the top to ensure the user sees the message
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Disappear after 3 seconds
            setTimeout(() => {
                alertBox.classList.add('hidden');
            }, 3000);
        } else {
            // Error handling
            alertBox.textContent = "Error: " + data.message;
            alertBox.className = "p-3 mb-4 rounded text-sm font-medium bg-red-100 text-red-700 block";
        }
    })
    .catch(err => {
        console.error(err);
        alert("An error occurred. Please try again.");
    });
});

});