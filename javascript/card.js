/**
 * Add all events to the selection on the card
 *
 * @param {jQuery} addCard
 */
var cardEvents = function (addCard) {

    // Add card
    $(addCard).on('click', function (eventClick) {
        var cardMentor = $(eventClick.target).parent();
        $(cardMentor.clone()).insertAfter(cardMentor);
    });

    // Remove card
    var closeCard = $(addCard).next();
    $(closeCard).on('click', function (eventClick) {
        var cardMentor = $(eventClick.target).parent();
        cardMentor.remove();
    });
};

// Wait DOM load
window.addEventListener('load', function () {
    let attoEditors = $('.editor_atto_content');
    // Check if is atto editor page
    if (attoEditors.length) {
        // Add events in cards existingg
        cardEvents('.add-card');

        attoEditors.on('DOMNodeInserted', (event) => {
            const target = $(event.target);
        
            if (target.hasClass('cards-mentor')) {
                // Add events in new card when it is added with atto snippet
                cardEvents(target.find('> :first-child > :first-child')[0]);
                
            }

            if (target.hasClass('card-mentor')) {
                // Add events in new card when it is added with card button
               cardEvents(target.find('> :first-child')[0]);
            }
        });
    }
});

if (navigator.userAgent.includes('Edg')) {
    document.querySelector(".row.cards-mentor").style.gap = '0rem';
    document.querySelector(".row.cards-mentor").style.marginLeft = '1.5rem';
  }
  
