/**
 * Javascript containing function of the catalog space
 */
define([
    'jquery',
     'local_mentor_core/cookie'
], function ($,cookie) {
    return {

        init: function () 
        {
            var that = this;

            if(location.search.indexOf('search')>=0 && cookie.read("dashboardSearch") !== null && cookie.read("dashboardSearch").length>3)
             {
                 $('#search-mentor-input').val(cookie.read("dashboardSearch"));
             }
            // Search on click.
            $('#search-mentor-button').on('click', function (){
                that.searchText();
            });

            
            // Search on enter keypress.
            $('#search-mentor-input').on('keypress', function () {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if (keycode === 13) {
                    that.searchText();
                }
            });

         },

         searchText: function(){

            var textToSearch = $('#search-mentor-input').val();

            // Clean the searched text.
            textToSearch = this.cleanupString(textToSearch);

            // Split the search text into words.
            var searchWords = this.splitString(textToSearch);

            // Create the search cookie.
            cookie.create('dashboardSearch',$('#search-mentor-input').val());

            //Reload page with search result
            window.location.href = M.cfg.wwwroot + '/my?search=' + searchWords;

         },
          /**
         * Cleanup a string 
         * @param {string} str
         * @returns {string}
         */
        cleanupString: function (str) {
            str = str.trim();
            var nonasciis = {'a': '[àáâãäå]', 'ae': 'æ', 'c': 'ç', 'e': '[èéêë]', 'i': '[ìíîï]', 'n': 'ñ', 'o': '[òóôõö]', 'oe': 'œ', 'u': '[ùúûűü]', 'y': '[ýÿ]'};
            for (var i in nonasciis) {
                str = str.replace(new RegExp(nonasciis[i], 'g'), i);
            }
            str = str.replace(/'/g, "\\''");
            return str;
        },

         /**
         * Split a string on spaces and remove words shorter than 3 caracters
         * @param {string} str
         * @returns {array}
         */
        splitString: function (str) {
            var split = str.split(' ');

            var words = [];

            for (var i in split) {
                if (words.indexOf(split[i]) == -1 && split[i].length > 2) {
                    words.push(split[i]);
                }
            }
            return words;
        },  
        

    }});
    

