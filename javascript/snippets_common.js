// Shared manipulation logic for the Mentor snippets that expose controls while editing:
// "Accordéon" (.add-collapse / .remove-collapse) and "Carte" (.add-card / .remove-card).
//
// Only the capture layer differs between the two editors - Atto edits in the page, TinyMCE
// inside an iframe - so everything below is plain DOM and is driven by snippets_editor.js.

var MentorSnippets = (function () {
    'use strict';

    var generateUID = function () {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    };

    var setAccordionAriaControl = function (card) {
        var collapseUid = generateUID();
        var buttonUid = generateUID();
        var content = card.querySelector('div.collapse-content');
        var header = card.querySelector('a.card-header');

        if (content) {
            content.setAttribute('id', collapseUid);
            content.setAttribute('aria-labelledby', buttonUid);
        }
        if (header) {
            header.setAttribute('id', buttonUid);
            header.setAttribute('aria-controls', collapseUid);
        }
    };

    // Ids must never be duplicated, and TinyMCE tags the nodes it manages with data-mce-*
    // attributes carrying internal state. Both are stripped before re-inserting a copy.
    var cloneNode = function (node) {
        var clone = node.cloneNode(true);
        var elements = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll('*')));

        elements.forEach(function (element) {
            Array.prototype.slice.call(element.attributes).forEach(function (attribute) {
                if (attribute.name.indexOf('data-mce-') === 0) {
                    element.removeAttribute(attribute.name);
                }
            });
            element.removeAttribute('id');
        });

        return clone;
    };

    var insertAfter = function (reference, node) {
        reference.parentNode.insertBefore(node, reference.nextSibling);
    };

    var addCollapse = function (control) {
        var card = control.closest('div.card');
        if (!card) {
            return;
        }
        var clone = cloneNode(card);
        setAccordionAriaControl(clone);
        insertAfter(card, clone);
    };

    var removeCollapse = function (control) {
        var accordion = control.closest('div.mentor-accordion');
        var card = control.closest('div.card');
        if (!accordion) {
            return;
        }
        // Removing the last panel removes the whole snippet.
        if (card && accordion.querySelectorAll('div.card').length > 1) {
            card.remove();
        } else {
            accordion.remove();
        }
    };

    var addCard = function (control) {
        var card = control.closest('div.card-mentor');
        if (!card) {
            return;
        }
        insertAfter(card, cloneNode(card));
    };

    var removeCard = function (control) {
        var card = control.closest('div.card-mentor');
        var row = control.closest('div.cards-mentor');
        if (!card) {
            return;
        }
        // Leaving an empty row behind would keep an invisible block in the content.
        if (row && row.querySelectorAll('div.card-mentor').length <= 1) {
            row.remove();
        } else {
            card.remove();
        }
    };

    var actions = [
        {selector: '.add-collapse', handler: addCollapse},
        {selector: '.remove-collapse', handler: removeCollapse},
        {selector: '.add-card', handler: addCard},
        {selector: '.remove-card', handler: removeCard}
    ];

    var resolve = function (target) {
        for (var i = 0; i < actions.length; i++) {
            var control = target.closest(actions[i].selector);
            if (control) {
                return {control: control, handler: actions[i].handler};
            }
        }
        return null;
    };

    return {
        /**
         * Generate the aria wiring of every accordion panel below root that lacks it.
         *
         * @param {Element} root
         */
        initAccordionAria: function (root) {
            if (!root) {
                return;
            }
            Array.prototype.forEach.call(root.querySelectorAll('.mentor-accordion div.card'), function (card) {
                var header = card.querySelector('a.card-header');
                if (header && !header.getAttribute('aria-controls')) {
                    setAccordionAriaControl(card);
                }
            });
        },

        /**
         * Run the snippet control the click landed on, if any.
         *
         * @param {Event} event
         * @param {Function} [transaction] wraps the mutation, used by TinyMCE for undo levels
         * @return {boolean} whether the click was on a snippet control
         */
        handleClick: function (event, transaction) {
            var target = event.target;
            if (!target || typeof target.closest !== 'function') {
                return false;
            }

            var action = resolve(target);
            if (!action) {
                return false;
            }

            // The controls sit inside <a class="card-header">, so the anchor must not follow
            // its href and the caret must not be placed on the icon.
            event.preventDefault();
            event.stopPropagation();

            var run = function () {
                action.handler(action.control);
            };

            if (transaction) {
                transaction(run);
            } else {
                run();
            }

            return true;
        }
    };
})();
