/**
 * Redirects to the last section visited in a session, when the course is in Thematic format.
 *
 * @module theme_mentor/comeback_to_section
 */
define(['jquery', 'core/ajax', 'core/notification'],
    function ($, Ajax, Notification) {
        return {
            'init': function (format, courseIdParam, sectionId) {
                // Prepare the variable that will contain the redirection URL,
                // and the course ID.
                let URL = null;
                let courseId = courseIdParam;

                // Prepare preference name for user preferences.
                const getPreferenceName = function () {
                    return `theme_mentor_course_${courseId}_lastsection`;
                };

                // Save the ID of the last section visited to user preferences.
                const setLastVisitedSection = function () {
                    if (sectionId) {
                        Ajax.call([{
                            methodname: 'core_user_set_user_preferences',
                            args: {
                                preferences: [
                                    {
                                        name: getPreferenceName(),
                                        value: sectionId.toString(),
                                        userid: 0  // 0 = current user
                                    }
                                ]
                            }
                        }])[0].fail(Notification.exception);
                    }
                };

                // Retrieves the ID of the last section visited from user preferences.
                const getLastVisitedSection = function (callback) {
                    Ajax.call([{
                        methodname: 'core_user_get_user_preferences',
                        args: {
                            name: getPreferenceName()
                        }
                    }])[0].done(function(response) {
                        if (response.preferences && response.preferences.length > 0) {
                            callback(response.preferences[0].value);
                        } else {
                            callback(null);
                        }
                    }).fail(function() {
                        callback(null);
                    });
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
                const comebackToCourse = function (referrerPathname, lastSectionId) {
                    // Dynamically retrieves information for building the
                    // redirection URL
                    let originUrl = document.location.origin;
                    let pathnameUrl = document.location.pathname;

                    // Building the redirect URL to course/section.php with the section ID
                    let locationUrl = `${originUrl}/course/section.php?id=${lastSectionId}`;

                    // Don't redirect if:
                    // 1. User is already on the same page type
                    // 2. User is coming from a section page (they want to go back to main course view)
                    if (referrerPathname == pathnameUrl || referrerPathname.includes('/course/section.php')) {
                        return false;
                    }

                    URL = locationUrl;
                    return true;
                }

                // If the course format is Topics and we have a course ID
                if (format == "topics" && courseId) {
                    // Retrieving the pathname of the previous page
                    let referrer = $('<a>', { href: document.referrer })[0];
                    let referrerPathname = referrer.pathname;

                    // If not currently viewing a section, retrieve the last visited section and redirect if needed
                    if (!isViewingSection()) {
                        getLastVisitedSection(function(lastSectionId) {
                            if (lastSectionId != null && comebackToCourse(referrerPathname, lastSectionId)) {
                                window.location.href = URL;
                                URL = null;
                            }
                        });
                    }

                    // Save the current section as the last visited section
                    setLastVisitedSection();
                }
            }
        };
    }
)