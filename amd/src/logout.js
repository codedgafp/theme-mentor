define(['jquery', 'local_mentor_core/cookie'], function ($, cookie) {
    return {
        init: function () {
            var that = this;

            // Clear cookies and session storage on user logout.
            $('#carousel-item-main > a').on('click', function (e) {
                if(e.currentTarget.href.indexOf(M.cfg.wwwroot + "/login/logout.php") <= -1) {
                    return;
                }

                sessionStorage.setItem('mentor_local_catalog_selected_training', []);

                cookie.erase('catalogFilters');
                cookie.erase('catalogSearch');

                cookie.erase('libraryFilters');
                cookie.erase('librarySearch');

                // Remove training management page cookies.
                cookie.getCookieNameByMatch(/^trainings_filter_entity_\d+=/)
                    .forEach(function(cookieName){
                        cookie.erase(cookieName);
                    });

                // Remove session management page cookies.
                cookie.getCookieNameByMatch(/^sessions_filter_entity_\d+=/)
                    .forEach(function(cookieName){
                        cookie.erase(cookieName);
                    });
            });
        }
    };
});
