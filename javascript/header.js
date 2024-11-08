/**
 * Event to change margin value on scroll in session
 */

$(document).ready(function () {
    function adjustDrawerMargin(forcedMargin) {
        var marginValue = forcedMargin != null ? forcedMargin : 142 - $(window).scrollTop();
        $('.drawer-left, .drawer-right').css('margin-top', marginValue > 0 ? `${marginValue}px` : '0');
    }

    function setAdjustmentDuringResize() {
        if ($(window).width() <= 1247) {
            adjustDrawerMargin(0);
            $(window).unbind('scroll');
            return;
        }

        adjustDrawerMargin();
        $(window).scroll(function () {
            adjustDrawerMargin();
        });
    }

    setAdjustmentDuringResize();

    $(window).resize(() => setAdjustmentDuringResize())
});
