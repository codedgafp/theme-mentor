// Collapse event
$(document).ready(function () {
    const chevronDown = '<i class="collapse-chevron fas fa-chevron-down" aria-hidden="true"></i>'
    const chevronUp = '<i class="collapse-chevron fas fa-chevron-up" aria-hidden="true"></i>'
    // Set aria-expanded to all card-header on the page.
    $('.card-header').each(function () {
        if ($(this).hasClass('opened')) {
            $(this).attr('aria-expanded', "true");
            $('.header-right', this).html(chevronUp);
        } else {
            $(this).attr('aria-expanded', "false");
            $('.header-right', this).html(chevronDown);
        }
    });

    

    // Set collapse position with set browser mobile size.
    $('body .mentor-accordion .card-header').each(function (index, element) {
        // When Collapse isn't in the atto snippet editor
        if (!$(element).parents('.editor_atto_content').length) {

            // Get target collapse.
            var collapseTarget = element.parentElement.parentElement;

            // Get target collapse element.
            var contentTarget = $(element.nextElementSibling, collapseTarget);

            // Get collapse mobile size data when page is loaded.
            var mobileSize = contentTarget.data('collapseMobileSize');

            // Is not mobile size.
            if (window.innerWidth > mobileSize) {
                return null;
            }

            // Get collapse mobile action data when page is loaded.
            var mobileAction = contentTarget.data('collapseMobileAction');

            // Collapse is close when browser has mobile size.
            if (mobileAction === 'close') {

                // Hidden target element.
                contentTarget.removeClass('show');

                // Remove 'opened' class to target collapse element header.
                $(element).removeClass('opened');

                // Set aria expanded to false.
                $(element).attr('aria-expanded', "false");
                $(element).find('button').attr('aria-expanded', "false");

                // Change header right target collapse element to close.
                $('.header-right', element).html(chevronDown);
            }

            // Collapse is open when browser has mobile size.
            if (mobileAction === 'open') {
                // Show target element.
                contentTarget.addClass('show');

                // Add 'opened' class to target collapse element header.
                contentTarget.addClass('opened');

                // Set aria expanded to true.
                $(element).attr('aria-expanded', "true");
                $(element).find('button').attr('aria-expanded', "true");

                // Change header right target collapse element indicator to open.
                $('.header-right', element).html(chevronUp);
            }
        }
    });

    $('body').on('click', '.card-header', function (event) {
        event.preventDefault();

        // When Collapse isn't in the atto snippet editor
        if (!$(event.currentTarget).parents('.editor_atto_content').length) {

            // Get target collapse
            var collapseTarget = event.currentTarget.parentElement.parentElement;

            // Get target collapse element
            var contentTarget = $(event.currentTarget.nextElementSibling, collapseTarget);

            // When target element is opened
            if (contentTarget.hasClass('show')) {

                // Hidden target element
                contentTarget.removeClass('show');

                // Remove 'opened' class to target collapse element header
                $(event.currentTarget).removeClass('opened');

                // Set aria expanded to false.
                $(event.currentTarget).attr('aria-expanded', "false");
                $(event.currentTarget).find('button').attr('aria-expanded', "false");

                // Change header right target collapse element to close
                $('.header-right', event.currentTarget).html(chevronDown);
            } else {// When target element is closed
                contentTarget.addClass('show');

                // Change header right target collapse element indicator to open
                $('.header-right', event.currentTarget).html(chevronUp);

                // Add 'opened' class to target collapse element header
                if (!$(event.currentTarget).hasClass('opened')) {
                    $(event.currentTarget).addClass('opened');

                    // Set aria expanded to true.
                    $(event.currentTarget).attr('aria-expanded', "true");
                    $(event.currentTarget).find('button').attr('aria-expanded', "true");
                }

                // Check all element in target collapse
                $('.collapse', collapseTarget).each(function (index, content) {

                    // Check if is not target collapse element
                    if (!$(content).is(contentTarget)) {

                        // Hidden other collapse element
                        $(content).removeClass('show');

                        // Change header right other collapse element indicator to open
                        $('.header-right', $(content).prev()).html(chevronDown);

                        // Remove 'opened' to class other collapse element header
                        if ($(content).prev().hasClass('opened')) {
                            $(content).prev().removeClass('opened').attr('aria-expanded', "false");
                        }
                    }
                });

            }
        }
    });

    $(window).bind('load', function () {
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
    });

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

});
