(function() {
    'use strict';

    /**
     * Remove title attributes from all elements to prevent tooltips.
     */
    var removeTooltips = function() {
        // Remove title attributes from all elements
        var elementsWithTitle = document.querySelectorAll('[title]');
        elementsWithTitle.forEach(function(element) {
            element.removeAttribute('title');
        });
    };

    /**
     * Set up mutation observer to handle dynamically added elements.
     */
    var observeDynamicContent = function() {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            // Check the node itself
                            if (node.hasAttribute && node.hasAttribute('title')) {
                                node.removeAttribute('title');
                            }
                            // Check descendants
                            if (node.querySelectorAll) {
                                var descendants = node.querySelectorAll('[title]');
                                descendants.forEach(function(element) {
                                    element.removeAttribute('title');
                                });
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            removeTooltips();
            observeDynamicContent();
        });
    } else {
        // DOM already loaded
        removeTooltips();
        observeDynamicContent();
    }
})();
