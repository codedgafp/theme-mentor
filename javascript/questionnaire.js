document.addEventListener('DOMContentLoaded', function() {
    let infoicon = document.querySelector('.dropdown-menu.menu .dropdown-item i.icon.fa.fa-info');
    if (infoicon) {
        infoicon.setAttribute('aria-hidden', 'true');
        infoicon.removeAttribute("aria-label");
        infoicon.removeAttribute('title');
    }
});