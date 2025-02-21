$(document).ready(function () {
    // Close usertours pop-up when user click to the "X".
    $(document).on('click', 'span[data-flexitour] button.close', function () {
        $('span[data-flexitour] .modal-footer button[data-role="end"]').click();
    });
});

// Create an observer to monitor changes in the DOM
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.matches && node.matches('span[data-flexitour="container"].orphan')) {
                const viewportHeight = window.innerHeight,
                    elementHeight = $(node).outerHeight();

                let offsettop = (viewportHeight - elementHeight) / 2;

                setTimeout(() => {
                    $(node).css({
                        position: 'fixed',
                        top: `${offsettop}px`
                    });
                });
            }
        });
    });
});

// Observer configuration
observer.observe(document.body, {
    childList: true,    // Observe all added/deleted children
    subtree: true       // Observe the entire DOM
});