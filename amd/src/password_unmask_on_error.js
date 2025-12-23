
define([], function() {
    const init = () => {
        const err = document.getElementById('id_error_password');
        if (!err) { return; }

        const input = document.getElementById('id_password');
        const unmaskBtn = document.querySelector('[data-passwordunmask="unmask"]');
        if (!input || !unmaskBtn) { return; }

        unmaskBtn.setAttribute('role', 'button');
        unmaskBtn.setAttribute('aria-pressed', 'false');

        const toggle = (e) => {
            e.preventDefault();
            const isText = input.getAttribute('type') === 'text';
            input.setAttribute('type', isText ? 'password' : 'text');
            unmaskBtn.setAttribute('aria-pressed', isText ? 'false' : 'true');
            setTimeout(() => input.focus(), 0);
        };

        unmaskBtn.addEventListener('click', toggle);
        unmaskBtn.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) { toggle(e); }
        });
    };
    return { init };
});
