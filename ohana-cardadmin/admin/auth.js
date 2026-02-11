(() => {
  const sessionToken = 'ohana-admin-logged-in';
  const isLoggedIn = sessionStorage.getItem(sessionToken) === 'true';

  // If not logged in, redirect to the login page.
  // The check for window.location.pathname avoids an infinite redirect loop.
  if (!isLoggedIn && !window.location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
  }
})();
