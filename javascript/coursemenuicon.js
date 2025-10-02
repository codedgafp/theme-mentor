document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll(  'div#region-main-box div#region-main-settings-menu a[id^="action-menu-toggle-"] i.icon.fa-ellipsis-vertical').forEach(function (icon) {
        icon.classList.remove('fa-ellipsis-vertical');
        icon.classList.add('fa-cog');
    });

    document.querySelectorAll('div.context-header-settings-menu i.icon.fa-ellipsis-vertical').forEach(function (icon) {
        icon.classList.remove('fa-ellipsis-vertical');
        icon.classList.add('fa-cog');
    });
});
