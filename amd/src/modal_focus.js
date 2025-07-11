define(['core/modal', 'core/local/aria/focuslock'], function (Modal, FocusLock) {
    const originalShow = Modal.prototype.show;

    Modal.prototype.show = function() {
        return originalShow.apply(this, arguments).then(() => {
            const root = this.getRoot();

            // Focus the close button.
            const closeBtn = root.find('.modal-header .close, .modal-header [data-action="hide"]');
            if (closeBtn.length) {
                closeBtn[0].focus();
            }

            // Trap focus within the modal.
            FocusLock.trapFocus(root.find('.modal-dialog')[0]);
        });
    };

    return {};
});