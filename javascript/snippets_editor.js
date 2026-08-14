// Capture layer for the snippet controls, for both editors.
//
// Atto edits in the page, so a single delegated listener on the document reaches its
// editable areas. TinyMCE edits inside an iframe - a separate document those selectors
// cannot reach - so the same logic is bound on the editor body instead.
//
// The manipulation itself lives in snippets_common.js and is shared by both.

(function () {
    'use strict';

    // Atto.

    var initAtto = function () {
        var editables = document.querySelectorAll('.editor_atto_content');
        if (!editables.length) {
            return;
        }

        var refresh = function () {
            editables.forEach(function (editable) {
                MentorSnippets.initAccordionAria(editable);
            });
        };

        // Snippets inserted after load need their aria wiring too. Only panels missing it
        // are touched, so this settles after one pass.
        var observer = new MutationObserver(refresh);
        editables.forEach(function (editable) {
            observer.observe(editable, {childList: true, subtree: true});
        });

        refresh();
    };

    // Bound once on the document: it does not depend on when Atto finishes initialising.
    // The guard keeps the controls inert on the rendered page, where they are hidden.
    document.addEventListener('click', function (event) {
        if (!event.target || typeof event.target.closest !== 'function') {
            return;
        }
        if (!event.target.closest('.editor_atto_content')) {
            return;
        }
        MentorSnippets.handleClick(event);
    });

    window.addEventListener('load', initAtto);

    // TinyMCE.

    var bindEditor = function (editor) {
        if (!editor || editor.mentorSnippetsBound) {
            return;
        }
        editor.mentorSnippetsBound = true;

        editor.on('click', function (event) {
            var handled = MentorSnippets.handleClick(event, function (run) {
                // transact() records an undo level, otherwise Ctrl+Z steps over the change.
                editor.undoManager.transact(run);
            });

            if (handled) {
                editor.setDirty(true);
            }
        });

        var refresh = function () {
            MentorSnippets.initAccordionAria(editor.getBody());
        };

        editor.on('init', refresh);
        editor.on('SetContent', refresh);
    };

    var attach = function () {
        window.tinyMCE.on('AddEditor', function (event) {
            bindEditor(event.editor);
        });

        // Editors already created before this script ran.
        if (typeof window.tinyMCE.get === 'function') {
            (window.tinyMCE.get() || []).forEach(bindEditor);
        }
    };

    // Never call getTinyMCE(): it injects the TinyMCE script, which would load the editor
    // on every page of the site. We only react if something else loads it.
    var waitForTinyMCE = function () {
        if (window.tinyMCE) {
            attach();
            return;
        }

        var watchScript = function (script) {
            script.addEventListener('load', function () {
                if (window.tinyMCE) {
                    attach();
                }
            }, {once: true});
        };

        var existing = document.querySelector('script[data-tinymce="tinymce"]');
        if (existing) {
            watchScript(existing);
            return;
        }

        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var nodes = mutations[i].addedNodes;
                for (var j = 0; j < nodes.length; j++) {
                    var node = nodes[j];
                    if (node.tagName === 'SCRIPT' && node.getAttribute('data-tinymce') === 'tinymce') {
                        observer.disconnect();
                        watchScript(node);
                        return;
                    }
                }
            }
        });

        observer.observe(document.head, {childList: true});
    };

    waitForTinyMCE();
})();
