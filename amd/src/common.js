// common.js
define([], function () {
    return {
        //RGAA
        moveSecondPrevstepToMain: function () {
            const mainElement = document.querySelector('main');
            const prevstepElements = document.querySelectorAll('.prevstep');
            if (mainElement && prevstepElements.length > 1) {
                const footerLink = prevstepElements[1];
                mainElement.appendChild(footerLink);
            }
        },
        //RGAA
        addClearFixToMainTag: function () {
            var element = document.querySelector('main[role="main"]');
            if (element) {
                element.classList.add('clearfix');
            }
        },
        //RGAA
        wrapeAsideTagInNavTag: function () {
            let asideTag = document.getElementById('block-region-side-pre');
            if (asideTag) {
                let navTag = document.createElement('nav');
                navTag.setAttribute('aria-label', 'Navigation de coté');
                navTag.setAttribute('role', 'navigation');
                asideTag.parentNode.insertBefore(navTag, asideTag);
                navTag.appendChild(asideTag);
            }
        }
    };
});
