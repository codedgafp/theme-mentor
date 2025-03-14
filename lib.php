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
 * Plugin library
 *
 * @package    theme_mentor
 * @copyright  2020 Edunao SAS (contact@edunao.com)
 * @author     adrien <adrien@edunao.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Get the scss content of the theme
 *
 * @param $theme
 * @return string
 */
function theme_mentor_get_main_scss_content($theme) {

    // Include the scss of the boost theme.
    $scss = theme_boost_get_main_scss_content($theme);

    return $scss;
}

/**
 * Initialize the page
 *
 * @param moodle_page $page
 * @throws coding_exception
 * @throws moodle_exception
 */
function theme_mentor_page_init(moodle_page $page) {
    global $CFG, $PAGE;

    $page->requires->js_call_amd('theme_mentor/logout', 'init');
    $page->requires->js_call_amd('theme_mentor/search', 'init');

    // Check if browser/OS is compatible.
    theme_mentor_check_and_redirect_browser_compatibility();

    if (theme_mentor_is_in_mentor_page()) {

        $page->add_body_class('mentor-page');

        require_once($CFG->dirroot . '/local/mentor_core/api/entity.php');

        $entity = \local_mentor_core\entity_api::get_entity($page->category->parent);

        // Add a body class for entity managers.
        if (has_capability('local/entities:manageentity', $entity->get_context())) {
            $page->add_body_class('mentor-editing');
        }
    }

    // Add a body class if the current course page is roles assign.
    if ($page->pagetype === 'admin-roles-assign' && $page->context->contextlevel === CONTEXT_COURSECAT) {
        require_once($CFG->dirroot . '/local/mentor_core/api/entity.php');
        // Check if context entity is not main entity.
        $entity = \local_mentor_core\entity_api::get_entity($page->context->instanceid);
        if (!$entity->is_main_entity()) {
            $page->add_body_class('sub-entity');

            // List of role except.
            // TODO : to settings ?
            $execeptrolesshortname = [
                'respformation',
            ];

            // Replace shortname role to name role.
            $exceptrolesname = array_map(function($roleshortname) {
                return \local_mentor_core\database_interface::get_instance()->get_role_by_name($roleshortname)->name;
            }, $execeptrolesshortname);

            // Call Js.
            $page->requires->js_call_amd('theme_mentor/roles_assign', 'init', [$exceptrolesname, is_siteadmin()]);
        }
    }
}

/**
 * Check browser compatibility.
 * $CFG->browserrequirements must be defined in config.php
 * ex :
 * $CFG->browserrequirements = [
 * "Edge"    => 79,
 * "Chrome"  => 66,
 * "Firefox" => 78,
 * "Safari"  => 15,
 * "Opera"   => 53
 * ];
 *
 * @return boolean
 */
function theme_mentor_check_browser_compatible() {
    global $CFG;

    $browserinformations = get_browser();

    if (!isset($CFG->browserrequirements)) {
        return true;
    }

    if (!array_key_exists($browserinformations->browser, $CFG->browserrequirements)) {
        return false;
    }

    return $CFG->browserrequirements[$browserinformations->browser] <= intval($browserinformations->version) ||
           $browserinformations->version === '0.0';
}

/**
 * Check if the page has a previous button in the bottom of the page.
 * If so, return the button data.
 *
 * @return false|stdClass
 * @throws coding_exception
 * @throws moodle_exception
 */
function theme_mentor_get_previous_button() {
    global $PAGE;

    if (!$PAGE->has_set_url()) {
        return false;
    }

    // Back to the course for activity.
    if (strpos($PAGE->url, '/mod/') !== false && $PAGE->course->format != 'singleactivity') {
        $prevbutton = new stdClass();
        $prevbutton->prevstepurl = (new moodle_url('/course/view.php',
            ['id' => $PAGE->course->id, 'section' => $PAGE->cm->sectionnum]
        ))->out(false);
        $prevbutton->prevstetitle = get_string('exittomod', 'theme_mentor');
        return $prevbutton;
    }

    // Back to the catalog for training catalog.
    if (strpos($PAGE->url, '/local/catalog/pages/') !== false) {
        $prevbutton = new stdClass();
        $prevbutton->prevstepurl = (new moodle_url('/local/catalog/index.php'))->out(false);
        $prevbutton->prevstetitle = get_string('prevstepcatalog', 'theme_mentor');
        return $prevbutton;
    }

    // Back to the dashboard for training sheet.
    if (strpos($PAGE->url, '/local/trainings/pages/training.php') !== false) {
        $prevbutton = new stdClass();
        $prevbutton->prevstepurl = (new moodle_url('/'))->out();
        $prevbutton->prevstetitle = get_string('prevstepdashboard', 'theme_mentor');
        return $prevbutton;
    }

    // Back to the training sheet page.
    if (strpos($PAGE->url, '/local/trainings/pages/preview.php') !== false) {
        $prevbutton = new stdClass();
        $trainingid = required_param('trainingid', PARAM_INT);
        $prevbutton->prevstepurl = (new moodle_url('/local/trainings/pages/update_training.php',
            ['trainingid' => $trainingid]))->out();
        $prevbutton->prevstetitle = get_string('closetrainingpreview', 'local_trainings');
        return $prevbutton;
    }

    // Back to the library page.
    if (strpos($PAGE->url, '/local/library/pages/training.php') !== false) {
        $prevbutton = new stdClass();
        $prevbutton->prevstepurl = (new moodle_url('/local/library/index.php'))->out();
        $prevbutton->prevstetitle = get_string('libraryreturn', 'theme_mentor');
        return $prevbutton;
    }

    return false;
}

/**
 * Check and redirect if the browser/OS is not compatible.
 */
function theme_mentor_check_and_redirect_browser_compatibility() {
    global $CFG, $PAGE;

        if (  ($PAGE->url->get_path() !== '/theme/mentor/pages/browser_not_compatible.php') && (!theme_mentor_check_browser_compatible() || core_useragent::is_ios()) ){
            redirect($CFG->wwwroot . '/theme/mentor/pages/browser_not_compatible.php');
        }    
}

/**
 * Check if it has course index in this course.
 *
 * @return bool
 */
function theme_mentor_has_course_index(): bool {
    global $PAGE;

    $dbi = \local_mentor_core\database_interface::get_instance();

    // False if course has format remui or tiles.
    if ($PAGE->course->format === 'remuiformat' || $PAGE->course->format === 'tiles') {
        return false;
    }

    // False if course has completion_progress block.
    if ($dbi->is_block_present_to_course($PAGE->course->id, 'completion_progress')) {
        return false;
    }

    // False if course has less than 1 section, excluding section 0.
    if (count(course_modinfo::instance($PAGE->course->id)->get_section_info_all()) <= 2) {
        return false;
    }

    if ($PAGE->course->format === 'topics') {

        // False if course has topics format and has summary block.
        if ($dbi->is_block_present_to_course($PAGE->course->id, 'summary')) {
            return false;
        }

        // False if course has topics format.
        // And has display course option set to "show all sections on one page".
        $courseoptions = format_topics::instance($PAGE->course->id)->get_format_options();
        if ($courseoptions['coursedisplay'] === 0) {
            return false;
        }
    }

    return true;
}

/**
 * User is in mentor pages (ex : contact page)
 *
 * @return bool
 */
function theme_mentor_is_in_mentor_page() {
    global $PAGE;

    // Not in course.
    if ($PAGE->context->contextlevel !== CONTEXT_COURSE &&
        $PAGE->context->contextlevel !== CONTEXT_MODULE) {
        return false;
    }

    // Course category is not "Pages" sub category name.
    if (isset($PAGE->category->name) && $PAGE->category->name != 'Pages') {
        return false;
    }

    $disabledformats = ['site', 'edadmin'];

    // Is not site or edadmin format.
    if (in_array($PAGE->course->format, $disabledformats)) {
        return false;
    }

    return true;
}
