function addClearFixToMainTag() {
    document.addEventListener("DOMContentLoaded", function () {
        var element = document.querySelector('main[role="main"]');
        if (element) {
            element.classList.add('clearfix');
        }
    });
}
