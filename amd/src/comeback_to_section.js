/**
 * Redirects to the last section visited in a session, when the course is in Thematic format.
 *
 * @module theme_mentor/comeback_to_section
 */
define(['jquery'],
    function ($) {
        return {
            'init': function (format, courseIdParam, sectionId) {
                // Prepare the variable that will contain the redirection URL,
                // and the course ID.
                let URL = null;
                let courseId = courseIdParam;

                // Prepare key name in local storage.
                const localStorageKeyElements = {
                    course: "mdl-topics-course-",
                    lastSection: "-lastSecId",
                };

                // Defines the key name in local storage
                const encodeLastVistedSectionKeyName = function () {
                    return `${localStorageKeyElements.course}${courseId}${localStorageKeyElements.lastSection}`;
                };

                // Stock in local storage the ID of the last section visited.
                const setLastVisitedSection = function () {
                    localStorage.removeItem(encodeLastVistedSectionKeyName());
                    if (sectionId) {
                        localStorage.setItem(encodeLastVistedSectionKeyName(), sectionId.toString());
                    }
                };

                // Retrieves the ID of the last section visited.
                const getLastVisitedSection = function () {
                    return localStorage.getItem(encodeLastVistedSectionKeyName());
                }

                // Retrieves the pathname of the URL from which the user came.
                const urlParam = function (name) {
                    let results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
                    return results ? decodeURIComponent(results[1]) : null;
                };

                // Checks if we're on the course/section.php page
                const isOnSectionPage = function () {
                    return document.location.pathname.includes('/course/section.php');
                };

                // Checks if we're viewing a specific section (on any page type)
                const isViewingSection = function () {
                    // Check for section parameter on course/view.php
                    if (urlParam('section') !== null || urlParam('sectionid') !== null) {
                        return true;
                    }
                    // Check if we're on course/section.php (which always displays a section)
                    if (isOnSectionPage() && urlParam('id') !== null) {
                        return true;
                    }
                    return false;
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

                    // Building the redirect URL using sectionid parameter (works with Moodle 4.5)
                    // This redirects to course/view.php with the section ID
                    let courseViewPath = pathnameUrl.includes('/course/section.php')
                        ? pathnameUrl.replace('/course/section.php', '/course/view.php')
                        : pathnameUrl;
                    let locationUrl = `${originUrl}${courseViewPath}?id=${courseId}&sectionid=${getLastVisitedSection()}`;

                    // Checks that the user is not on a course section page
                    if (referrerPathname != pathnameUrl) {
                        URL = locationUrl;
                        return true;
                    }

                    return false;
                }

                // If the course format is Topics and we have a course ID
                if (format == "topics" && courseId) {
                    // Retrieving the pathname of the previous page
                    let referrer = $('<a>', { href: document.referrer })[0];
                    let referrerPathname = referrer.pathname;

                    // If the key and value of the last section are present in
                    // the local storage and a redirection is required, the user
                    // is sent to the last section visited only if not currently viewing a section.
                    // This handles course/view.php?section=X, course/view.php?sectionid=X, and course/section.php?id=X

                    // Only redirect if not already viewing a section and we have a stored section
                    if (!isViewingSection() && getLastVisitedSection() != null && comebackToCourse(referrerPathname)) {
                        window.location.href = URL;
                        URL = null;
                    }

                    setLastVisitedSection();
                }
            }
        };
    }
)