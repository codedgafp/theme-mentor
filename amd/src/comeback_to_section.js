/**
 * Redirects to the last section visited in a session, when the course is in Thematic format.
 * 
 * @module theme_mentor/comeback_to_section
 */
define(['jquery'],
    function ($) {
        return {
            'init': function (format, sectionNum) {
                // Prepare the variable that will contain the redirection URL,
                // and the course ID.
                let URL = null;
                let courseId = null;

                // Prepare key name in local storage.
                const localStorageKeyElements = {
                    course: "mdl-topics-course-",
                    lastSection: "-lastSecId",
                };

                // Defines the key name in local storage
                const encodeLastVistedSectionKeyName = function () {
                    return `${localStorageKeyElements.course}${courseId}${localStorageKeyElements.lastSection}`;
                };

                // Stock in local storage the number of the last section visited.
                const setLastVisitedSection = function () {
                    localStorage.removeItem(encodeLastVistedSectionKeyName());

                    if (sectionNum) {
                        localStorage.setItem(encodeLastVistedSectionKeyName(), sectionNum.toString());
                    }
                };

                // Retrieves the number of the last section visited.
                const getLastVisitedSection = function () {
                    return localStorage.getItem(encodeLastVistedSectionKeyName());
                }

                // Retrieves the pathname of the URL from which the user came.
                const urlParam = function (name) {
                    let results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
                    return results ? decodeURIComponent(results[1]) : null;
                };

                /* 
                Checks whether the user has come from a page other than the pages
                displaying the sections of a course. If so, redirects to the last
                section visited. This step prevents the page from reloading even
                if the user is in a course section.
                */
                const comebackToCourse = function (referrerPathname) {
                    // Dynamically retrieves information for building the
                    // redirection URL
                    let originUrl = document.location.origin;
                    let pathnameUrl = document.location.pathname;
                    let completeUrl = originUrl + pathnameUrl;

                    // Building the redirect URL
                    let locationUrl = `${completeUrl}?id=${courseId}&section=${getLastVisitedSection()}`;

                    // Checks that the user is not on a course section page
                    if (referrerPathname != pathnameUrl) {
                        URL = locationUrl;
                        return true;
                    }

                    return false;
                }

                // If the course format is Thematic
                if (format == "topics") {
                    courseId = urlParam('id');
                    // Retrieving the pathname of the previous page
                    let referrer = $('<a>', { href: document.referrer })[0];
                    let referrerPathname = referrer.pathname;

                    // If the key and value of the last section are present in
                    // the local storage and a redirection is required, the user
                    // is sent to the last section visited.
                    if (getLastVisitedSection() != null && comebackToCourse(referrerPathname)) {
                        window.location.href = URL;
                        URL = null;
                    }

                    setLastVisitedSection();
                }
            }
        };
    }
)