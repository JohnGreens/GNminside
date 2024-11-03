document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission
    const fornavn = document.getElementById('fornavn').value;
    const etternavn = document.getElementById('etternavn').value;
    const organisasjon = document.getElementById('organisasjon').value;
    const rolle = document.getElementById('rolle').value;
    const telefon = document.getElementById('telefon').value;
    const email = document.getElementById('email').value;
    const kommentar = document.getElementById('kommentar').value || null;

    // Fetch authID and authProvider from the server
    const authResponse = await fetch('/auth/api/auth-info');

    const { authID, authProvider, authProviderUsername, authProviderEmail} = await authResponse.json();

    const response = await fetch('/auth/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fornavn, etternavn, organisasjon, rolle, telefon, authID, authProvider, email,authProviderUsername,authProviderEmail,kommentar })
    
    });
    console.log(response)
    if (response.ok) {
        alert('Registering fullført du får beksjed når bruker er verifisert');
        window.location.href = '/login'; // Redirect to login page
    } else {
        const errorData = await response.json();
        alert('Registering feilet, login på nytt og forsøk igjen. Feilkode: ' + errorData.message);
    }
});