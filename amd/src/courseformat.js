define(['jquery'], function($) {
    return {
        init: function(isadmin) {
            if (!isadmin) {
                var $opt = $('a[data-value="edadmin"]').closest('.dropdown-item-outline');
                $opt.remove();
            }
        }
    };
});
