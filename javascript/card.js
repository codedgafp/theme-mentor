/**
 * Add all events to the selection on the card
 *
 * @param {jQuery} addCard
 */
var cardEvents = function (addCard) {

    // Add card
    document.addEventListener('click', function(event) {
        if (event.target.matches(addCard)) {
            var cardMentor = $(event.target).parent();
            $(cardMentor.clone()).insertAfter(cardMentor);
        }
    });

    // Remove card
    document.addEventListener('click', function(eventClick) {
        if (eventClick.target.matches('.remove-card')) {
            var cardMentor = $(eventClick.target).parent();
            cardMentor.remove();
        }
    });
}
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
            var targetElements = target.find('> :first-child > :first-child')[0];
            var selectorCards = targetElements.getAttribute('class'); // Or generate an appropriate selector
            cardEvents(`.${selectorCards}`);
            
            }

            if (target.hasClass('card-mentor')) {                
            // Add events in new card when it is added with card button
            var targetElement = target.find('> :first-child')[0];
            var selector = targetElement.getAttribute('class'); // Or generate an appropriate selector
            cardEvents(`.${selector}`);  // Pass a valid string selector to cardEvents
            }
        });
    }
});

$(document).ready(function () {
    // Select all elements with the class .card-body within the hierarchy
    const cardBodies = document.querySelectorAll('.row.cards-mentor .card.card-mentor .card-body');
    
    // Iterate through each .card-body element
    cardBodies.forEach(cardBody => {
        // Select the last child <a> element within each .card-body
        const lastChildLink = cardBody.querySelector('a:last-child');
        
        // Add the new class to the <a> element
        if (lastChildLink) {
            lastChildLink.classList.add('btn');
            lastChildLink.classList.add('btn-primary');
            lastChildLink.classList.add('card-link');
        }
    });
    });