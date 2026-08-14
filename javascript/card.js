// The add/remove controls of the editable cards live in snippets_common.js /
// snippets_editor.js, shared with TinyMCE.

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