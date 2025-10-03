<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * A drawer based layout for the boost theme.
 *
 * @package   theme_boost
 * @copyright 2021 Bas Brands
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/behat/lib.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/theme/mentor/classes/output/mentor_primary.php');

// Add block button in editing mode.
$addblockbutton = $OUTPUT->addblockbutton();

if (isloggedin()) {
    $courseindexopen = (get_user_preferences('drawer-open-index', true) == true);
} else {
    $courseindexopen = false;
}

$extraclasses = ['uses-drawers'];
if ($courseindexopen) {
    $extraclasses[] = 'drawer-open-index';
}

// Default, Does not have course index.
$courseindex = false;

$blockshtml = $OUTPUT->blocks('side-pre');

$hasblocks = (strpos($blockshtml, 'data-block=') !== false || !empty($addblockbutton));
$infoblockhtml = "";
// If is course.
if ($PAGE->course && $PAGE->course->id !== SITEID) {
    $training = \local_mentor_core\training_api::get_training_by_course_id($PAGE->course->id);
    $session = \local_mentor_core\session_api::get_session_by_course_id($PAGE->course->id);

    $isarchivedsession = $session ? ($session->status ===  \local_mentor_core\session::STATUS_ARCHIVED) : false;
    if($isarchivedsession){

        $infoblockhtml = html_writer::start_tag('section', [
            'class' => 'block block_html card mb-3',
            'role' => 'complementary',
            'data-block' => 'html'
        ]);

        $infoblockhtml .= html_writer::start_tag('div', ['class' => 'card-body']);
        $infoblockhtml .=  get_string('infoblockarchivedsession', 'theme_mentor');
        $infoblockhtml .= html_writer::end_tag('div');

        $infoblockhtml .= html_writer::end_tag('section'); 
        $hasblocks = true;
    }
    $blockshtml = $infoblockhtml . $blockshtml;

    // If the course is linked to a training or session.
    if ($training || $session) {
        // Open block drawer.
        $blockdraweropen = true;

        // Check if it has course index.
        if (theme_mentor_has_course_index()) {
            $courseindex = core_course_drawer();
        }
    } else {
        $isinpresentationpage = false;

        // Add block if user is in entity presentation page.
        if (theme_mentor_is_in_mentor_page()) {
            $entity = \local_mentor_core\entity_api::get_entity($PAGE->category->parent);
            $presentationpage = $entity->get_presentation_page_course();
            if ($presentationpage->id === $PAGE->course->id) {
                // Open block drawer.
                $blockdraweropen = true;
                $isinpresentationpage = true;
            }
        }

        if (!$isinpresentationpage) {
            $hasblocks = false;
        }
    }

    // Delete secondary navigation to course.
    $PAGE->set_secondary_navigation(false);
} else {
    // If it is not a training or a session, consider that there is no block.
    $hasblocks = false;
}

if (!$hasblocks) {
    $blockdraweropen = false;
}

if (!$courseindex) {
    $courseindexopen = false;
}

$bodyattributes = $OUTPUT->body_attributes($extraclasses);
$forceblockdraweropen = $OUTPUT->firstview_fakeblocks();

$secondarynavigation = false;
$overflow = '';
if ($PAGE->has_secondary_navigation() && $PAGE->context->id === 1) {
    $tablistnav = $PAGE->has_tablist_secondary_navigation();
    $moremenu = new \core\navigation\output\more_menu($PAGE->secondarynav, 'nav-tabs', true, $tablistnav);
    $secondarynavigation = $moremenu->export_for_template($OUTPUT);
    $overflowdata = $PAGE->secondarynav->get_overflow_menu_data();
    if (!is_null($overflowdata)) {
        $overflow = $overflowdata->export_for_template($OUTPUT);
    }
}

$primary = new \mentor_primary($PAGE);
$renderer = $PAGE->get_renderer('core');
$primarymenu = $primary->export_for_template($renderer);
$buildregionmainsettings = !$PAGE->include_region_main_settings_in_header_actions() && !$PAGE->has_secondary_navigation();
// If the settings menu will be included in the header then don't add it here.
$regionmainsettingsmenu = $buildregionmainsettings ? $OUTPUT->region_main_settings_menu() : false;

$header = $PAGE->activityheader;
$headercontent = $header->export_for_template($renderer);

$templatecontext = [
    'sitename' => format_string($SITE->shortname, true, ['context' => context_course::instance(SITEID), "escape" => false]),
    'output' => $OUTPUT,
    'sidepreblocks' => $blockshtml,
    'hasblocks' => $hasblocks,
    'bodyattributes' => $bodyattributes,
    'courseindexopen' => $courseindexopen,
    'blockdraweropen' => $blockdraweropen,
    'courseindex' => $courseindex,
    'primarymoremenu' => $primarymenu['moremenu'],
    'secondarymoremenu' => $secondarynavigation ?: false,
    'mobileprimarynav' => $primarymenu['mobileprimarynav'],
    'usermenu' => $primarymenu['user'],
    'langmenu' => $primarymenu['lang'],
    'forceblockdraweropen' => $forceblockdraweropen,
    'regionmainsettingsmenu' => $regionmainsettingsmenu,
    'hasregionmainsettingsmenu' => !empty($regionmainsettingsmenu),
    'overflow' => $overflow,
    'headercontent' => $headercontent,
    'addblockbutton' => $addblockbutton,
    'hasprevbutton' => theme_mentor_get_previous_button(),
];

echo $OUTPUT->render_from_template('theme_boost/drawers', $templatecontext);
