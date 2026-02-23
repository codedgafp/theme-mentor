// Collapse event
$(document).ready(function () {
    const chevronDown = '<i class="collapse-chevron fas fa-chevron-down" aria-hidden="true"></i>'
    const chevronUp = '<i class="collapse-chevron fas fa-chevron-up" aria-hidden="true"></i>'
    // Set aria-expanded to all card-header on the page.
    $('body .mentor-accordion .card-header').each(function () {
        if ($(this).hasClass('opened')) {
            $(this).attr('aria-expanded', "true");
            $('.header-right', this).html(chevronUp);
        } else {
            $(this).attr('aria-expanded', "false");
            $('.header-right', this).html(chevronDown);
        }
    });

    // Set collapse position with set browser mobile size.
    $("body .mentor-accordion .card-header").each(set_collapse_mobile_size);

    $("body").on("click", ".mentor-accordion .card-header", function (event) {
        event.preventDefault();

        if ($(event.currentTarget).parents('.editor_atto_content').length == false) {
            var collapseTarget = event.currentTarget.parentElement.parentElement;
            var contentTarget = $(event.currentTarget.nextElementSibling, collapseTarget);

            if (contentTarget.hasClass('show')) {
                contentTarget.removeClass('show');
                $(event.currentTarget).removeClass('opened');

                $(event.currentTarget).attr('aria-expanded', "false");
                $(event.currentTarget).find('button').attr('aria-expanded', "false");

                $('.header-right', event.currentTarget).html(chevronDown);
            } else {
                contentTarget.addClass('show');
                $('.header-right', event.currentTarget).html(chevronUp);

                if (!$(event.currentTarget).hasClass('opened')) {
                    $(event.currentTarget).addClass('opened');

                    $(event.currentTarget).attr('aria-expanded', "true");
                    $(event.currentTarget).find('button').attr('aria-expanded', "true");
                }

                $('.collapse', collapseTarget).each(function (index, content) {
                    if (!$(content).is(contentTarget)) {
                        $(content).removeClass('show');
                        $('.header-right', $(content).prev()).html(chevronDown);

                        if ($(content).prev().hasClass('opened')) {
                            $(content).prev().removeClass('opened').attr('aria-expanded', "false");
                        }
                    }
                });
            }
        }
    });

    $(window).bind('load', function () {
        attoEditorObserver();
        newAccordionObserver();
    });

    function attoEditorObserver() {
        let attoEditors = $('.editor_atto_content');
        if (attoEditors.length === 0) return;

        const observer = new MutationObserver(mutationsList => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    $(mutation.addedNodes).each(function () {
                        const target = $(this);
                        if (target.hasClass('mentor-accordion')) initAccordion(target);
                    });
                }
            }
        });

        const config = { childList: true, subtree: true };

        attoEditors.each(function () {
            observer.observe(this, config);
        });

        attoEditors.find(".mentor-accordion").each(function () {
            initAccordion($(this));
        });
    }

    function newAccordionObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    $(node).find('.mentor-accordion .card-header').each(set_collapse_mobile_size);
                });
            });
        });

        const config = { childList: true, subtree: true };

        observer.observe($("body")[0], config);
    }

    function initAccordion(accordion) {
        accordion.find("div.card").each(function () {
            setAccordionLiAriaControl($(this));
        });

        accordion.find(".remove-collapse").on('click', function () {
            const card = $(this).closest('div.card');
            const snippet = $(this).closest('div.mentor-accordion');
            snippet.find('div.card').length > 1 ? card.remove() : snippet.remove();
        });

        accordion.find(".add-collapse").on('click', function () {
            const card = $(this).closest('div.card');
            const $newCard = card.clone(true);
            setAccordionLiAriaControl($newCard);
            card.after($newCard);
        });
    }

    function setAccordionLiAriaControl(card) {
        let collapseUid = generateUID();
        let buttonUid = generateUID();
        card.find("div.collapse-content")
            .attr('id', collapseUid)
            .attr('aria-labelledby', buttonUid);
        card.find("a.card-header")
            .attr('id', buttonUid)
            .attr('aria-controls', collapseUid);
    }


    function generateUID() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }

    function set_collapse_mobile_size(index, element) {
        if ($(element).parents('.editor_atto_content').length == false) {
            var collapseTarget = element.parentElement.parentElement;
            var contentTarget = $(element.nextElementSibling, collapseTarget);
            var mobileSize = contentTarget.data('collapseMobileSize');

            if (window.innerWidth > mobileSize) {
                return null;
            }

            var mobileAction = contentTarget.data('collapseMobileAction');

            if (mobileAction === 'close') {
                contentTarget.removeClass('show');
                $(element).removeClass('opened');

                $(element).attr('aria-expanded', "false");
                $(element).find('button').attr('aria-expanded', "false");

                $('.header-right', element).html(chevronDown);
            }

            if (mobileAction === 'open') {
                contentTarget.addClass('show');
                contentTarget.addClass('opened');

                $(element).attr('aria-expanded', "true");
                $(element).find('button').attr('aria-expanded', "true");

                $('.header-right', element).html(chevronUp);
            }
        }
    }
});
