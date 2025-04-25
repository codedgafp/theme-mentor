$(document).ready(function () {
    if ($('#scorm_layout').length) {
        $('#scorm_layout').observeHeightChanges();
    }
});

$.fn.observeHeightChanges = function () {
    const $element = this;

    const observer = new MutationObserver(updatescormlayoutheight);

    const config = {
        attributes: true,
        attributeFilter: ['style', 'class'],
        childList: true,
        subtree: true
    };

    observer.observe($element[0], config);

    $element.data('height-mutation-observer', observer);

    return this;
};

function updatescormlayoutheight(mutations) {
    let bodyheight = Y.one('body').get('winHeight') - 5,
        scormlayoutheiht = Y.one('#scorm_layout').getY(),
        windownheight = window.pageYOffset;

    let newheight = bodyheight - scormlayoutheiht - windownheight;

    if (isNaN(newheight)) {
        newheight = 680;
    }

    Y.one('#scorm_layout').setStyle('height', newheight);
}