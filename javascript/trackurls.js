// Set last visited url in session local storage global
// Browser does not allow access to history pages
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('lastVisitedUrl', window.location.href);
});