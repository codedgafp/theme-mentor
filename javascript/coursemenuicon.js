document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[id^="action-menu-toggle-"] i.icon.fa-ellipsis-vertical').forEach(function (icon) {
        icon.classList.remove('fa-ellipsis-vertical');
        icon.classList.add('fa-cog');
    });
});
