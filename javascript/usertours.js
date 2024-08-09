$(document).ready(function () {
    // Close usertours pop-up when user click to the "X".
    $(document)
        .on('click', 'span[data-flexitour] button.close', function () {
            $('span[data-flexitour] .modal-footer button[data-role="end"]').click();
        });
});