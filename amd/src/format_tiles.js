define(['jquery'], function($) {
    return {
        init: function() {
            this.removeTilesOverallProgress();
        },

        /**
         * If the 'completion_monitor' block exists in the course, remove the overall progress in the 'Tiles' format.
         */
        removeTilesOverallProgress: function() {
            $tilesOverallProgress = $('#tiles-overall-progress-outer');
            $blockCompletionMonitor = $(".block.block_completion_monitor[data-block='completion_monitor']");

            if ($tilesOverallProgress.length && $blockCompletionMonitor.length) {
                $tilesOverallProgress.remove();
            }
        }
    };
});
