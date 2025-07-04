document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('div.context-header-settings-menu i.icon.fa-ellipsis-vertical').forEach(function (icon) {
        icon.classList.remove('fa-ellipsis-vertical');
        icon.classList.add('fa-cog');
    });
});
