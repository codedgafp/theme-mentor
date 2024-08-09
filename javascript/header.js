/**
 * Event to change margin value on scroll in session
 */

$(document).ready(function () {
    function adjustDrawerMargin() {
        var marginValue = 142 - $(window).scrollTop();;
        $('.drawer-left, .drawer-right').css('margin-top', marginValue > 0 ? `${marginValue}px` : '0');
    }
    adjustDrawerMargin();

    $(window).scroll(function () {
        adjustDrawerMargin();
    });
});
