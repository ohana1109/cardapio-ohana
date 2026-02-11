document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  // --- Configurações de Login ---
  const validUsername = 'ohanasnack';
  // SHA-256 hash for "ohanahouse"
  const validPasswordHash = 'bc9d917177358d0f41bf36397adcc50e88a47a4774e69ad2207b359bdbfdcaec';
  const sessionToken = 'ohana-admin-logged-in';

  // If the user is already logged in, redirect to the admin panel
  if (sessionStorage.getItem(sessionToken) === 'true') {
    window.location.href = 'panel.html';
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.style.display = 'none';

    const username = event.target.username.value;
    const password = event.target.password.value;

    if (username !== validUsername) {
      errorMessage.style.display = 'block';
      return;
    }

    try {
      const enteredPasswordHash = await sha256(password);
      
      if (enteredPasswordHash === validPasswordHash) {
        // Success
        sessionStorage.setItem(sessionToken, 'true');
        window.location.href = 'panel.html'; // Redirect to the new panel
      } else {
        // Incorrect password
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Error hashing password:', error);
      errorMessage.textContent = 'An error occurred. Please try again.';
      errorMessage.style.display = 'block';
    }
  });

  /**
   * Calculates the SHA-256 hash of a string.
   * @param {string} str The string to hash.
   * @returns {Promise<string>} The hash as a hexadecimal string.
   */
  async function sha256(str) {
    const textAsBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hash;
  }
});
