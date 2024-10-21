document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission
    const fornavn = document.getElementById('fornavn').value;
    const etternavn = document.getElementById('etternavn').value;
    const organisasjon = document.getElementById('organisasjon').value;
    const rolle = document.getElementById('rolle').value;
    const telefon = document.getElementById('telefon').value;
    const email = document.getElementById('email').value;

  
    // Fetch authID and authProvider from the server
    const authResponse = await fetch('/auth/api/auth-info');

    const { authID, authProvider, authProviderUsername, authProviderEmail} = await authResponse.json();

    const response = await fetch('/auth/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fornavn, etternavn, organisasjon, rolle, telefon, authID, authProvider, email,authProviderUsername,authProviderEmail })
    
    });
    if (response.ok) {
        alert('Registration successful!');
        window.location.href = '/login'; // Redirect to login page
    } else {
        const errorData = await response.json();
        alert('Registration failed: ' + errorData.message);
    }
});