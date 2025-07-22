define(['jquery'], function($) {
    return {
        init: function() {
                var $opt = $('a[data-value="edadmin"]').closest('.dropdown-item-outline');
                $opt.remove();
        }
    };
});
