const btnNotif = document.querySelector('.popover-region-notifications');
const popover = document.querySelector('.popover-region-container');

function updatePopoverState() {
    if (btnNotif.classList.contains('collapsed')) {
        popover.style.display = 'none';
        popover.style.pointerEvents = 'none';
    } else {
        popover.style.display = 'block';
        popover.style.pointerEvents = 'auto';
    }
}

const observerPopup = new MutationObserver(() => {
    updatePopoverState();
});

observerPopup.observe(btnNotif, { attributes: true, attributeFilter: ['class'] });

// Initial state check
updatePopoverState();
