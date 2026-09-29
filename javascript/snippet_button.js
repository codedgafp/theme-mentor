// Opening behaviour of the "Bouton" snippet links: a link leaving Moodle opens in a new
// tab, a link staying inside it opens in the same one.

$(document).ready(function () {
    'use strict';

    let siteHost = new URL((M.cfg && M.cfg.wwwroot) || window.location.origin, window.location.href).host;

    let isExternal = function (link) {
        let url;

        try {
            url = new URL(link.getAttribute('href'), window.location.href);
        } catch (e) {
            return false;
        }

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false;
        }

        return url.host !== siteHost;
    };

    const buttons = document.querySelectorAll('a.btn-mentor-snippet[href]');

    Array.prototype.forEach.call(buttons, function (button) {
        // Prevent already set target attributes from being overridden.
        if (button.hasAttribute('target') || button.closest('[contenteditable="true"], .editor_atto_content')) {
            return;
        }

        if (isExternal(button)) {
            button.setAttribute('target', '_blank');
            button.setAttribute('rel', 'noopener noreferrer');
        }
    });
});
