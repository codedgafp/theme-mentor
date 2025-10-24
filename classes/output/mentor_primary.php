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

// Require mentor apis.
require_once(__DIR__ . '/../../../../config.php');
require_once($CFG->dirroot . '/local/mentor_core/api/entity.php');
require_once($CFG->dirroot . '/local/mentor_core/api/session.php');
require_once($CFG->dirroot . '/local/mentor_core/api/training.php');
require_once($CFG->dirroot . '/local/mentor_core/api/library.php');

use local_mentor_core\entity_api;
use local_mentor_core\profile_api;

/**
 * Primary navigation renderable
 *
 * This file combines primary nav, custom menu, lang menu and
 * usermenu into a standardized format for the frontend
 *
 * @package     core
 * @category    navigation
 * @copyright   2021 onwards Peter Dias
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class mentor_primary extends \core\navigation\output\primary
{
    /**
     * Combine the various menus into a standardized output.
     *
     * @param renderer_base|null $output
     * @return array
     */
    public function export_for_template(?renderer_base $output = null): array
    {
        global $PAGE;

        if (!$output) {
            $output = $PAGE->get_renderer('core');
        }

        $primarynav = $this->get_primary_nav();
        $menudata = (object) array_merge($primarynav, $this->get_custom_menu($output));
        $moremenu = new \core\navigation\output\more_menu($menudata, 'navbar-nav', false);
        $mobileprimarynav = array_merge($primarynav, $this->get_custom_menu($output));

        $languagemenu = new \core\output\language_menu($PAGE);

        return [
            'mobileprimarynav' => $mobileprimarynav,
            'moremenu' => $moremenu->export_for_template($output),
            'lang' => !isloggedin() || isguestuser() ? $languagemenu->export_for_template($output) : [],
            'user' => $this->get_user_menu($output),
        ];
    }

    protected function get_primary_nav($parent = null): array
    {
        global $PAGE, $USER, $DB;

        if ($USER->id === 0) {
            return [];
        }

        $primary = [];

        // Dashboard link.
        $primary[] = [
            'title' => get_string('dashboard', 'theme_mentor'),
            'url' => new \moodle_url('/my'),
            'text' => get_string('dashboard', 'theme_mentor'),
            'isactive' => strpos($PAGE->url, '/my/') !== false,
            'key' => get_string('dashboard', 'theme_mentor')
        ];

        $context = context_system::instance();
        $can_offer_access = has_capability('local/catalog:offeraccess', $context);
        if ($can_offer_access) {
            // Training catalog link.
            $primary[] = [
                'title' => get_string('trainingcatalog', 'theme_mentor'),
                'url' => new \moodle_url('/local/catalog/index.php'),
                'text' => get_string('trainingcatalog', 'theme_mentor'),
                'isactive' => strpos($PAGE->url, '/local/catalog/index.php') !== false,
                'key' => get_string('trainingcatalog', 'theme_mentor'),
            ];
        }

        if (\local_mentor_core\library_api::user_has_access()) {
            // Library link.
            $primary[] = [
                'title' => get_string('pluginname', 'local_library'),
                'url' => new \moodle_url('/local/library/index.php'),
                'text' => get_string('pluginname', 'local_library'),
                'isactive' => strpos($PAGE->url, '/local/library/index.php') !== false,
                'key' => get_string('pluginname', 'local_library'),
            ];
        }

        $highestrole = profile_api::get_highest_role_by_user($USER->id);

        // Define roles with "manage entities" button.
        $adminroles = ['admin', 'admindedie'];

        // Define roles with manage trainings and manage sessions buttons.
        $elevatedrole = ['respformation', 'referentlocal', 'reflocalnonediteur'];

        // Manage entities links.
        if (is_object($highestrole) && in_array($highestrole->shortname, $adminroles)) {

            $managedentitieswithothercapabilites = entity_api::count_managed_entities(
                null,
                false,
                null,
                true,
                is_siteadmin(),
                true
            );
            $strmanageentities = $managedentitieswithothercapabilites > 1 ? get_string('managemyentities', 'theme_mentor') :
                get_string('managemyentity', 'theme_mentor');

            $primary[] = [
                'title' => $strmanageentities,
                'url' => new \moodle_url('/local/entities/index.php'),
                'text' => $strmanageentities,
                'isactive' => strpos($PAGE->url, '/local/entities/index.php') !== false,
                'key' => $strmanageentities,
            ];

        } else if (is_object($highestrole) && in_array($highestrole->shortname, $elevatedrole)) { // Manage trainings links.

            if ($PAGE->course && $PAGE->course->id !== SITEID && $PAGE->course->format === 'edadmin') {
                $_SESSION['lastentity'] = $PAGE->course->category;
            }

            if (isset($_SESSION['lastentity'])) {
                $entity = local_mentor_core\entity_api::get_entity($_SESSION['lastentity']);
                $admincourselist = $entity->get_main_entity()->get_edadmin_courses();
                $trainingcourse = $admincourselist['trainings'];
                $sessioncourse = $admincourselist['session'];
            } else {
                // Manage trainings.
                $categories = entity_api::get_categories_with_capability($USER->id, 'local/trainings:manage');
                if (count($categories) > 0) {
                    $maincategoryid = array_key_first($categories);
                    $trainingcourse = entity_api::get_entity($maincategoryid)->get_edadmin_courses('trainings');
                }

                // Manage sessions.
                $categories = entity_api::get_categories_with_capability($USER->id, 'local/session:manage');
                if (count($categories) > 0) {
                    $maincategoryid = array_key_first($categories);
                    $sessioncourse = entity_api::get_entity($maincategoryid)->get_edadmin_courses('session');
                }
            }

            // Manage training link.
            if (!empty($trainingcourse)) {
                $primary[] = [
                    'title' => get_string('managetrainings', 'theme_mentor'),
                    'url' => new \moodle_url('/course/view.php', ['id' => $trainingcourse['id']]),
                    'text' => get_string('managetrainings', 'theme_mentor'),
                    'isactive' => strpos($PAGE->url, '/course/view.php?id=' . $trainingcourse['id']) !== false,
                    'key' => get_string('managetrainings', 'theme_mentor'),
                ];
            }

            // Manage session link.
            if (!empty($sessioncourse)) {
                $primary[] = [
                    'title' => get_string('managesessions', 'theme_mentor'),
                    'url' => new \moodle_url('/course/view.php', ['id' => $sessioncourse['id']]),
                    'text' => get_string('managesessions', 'theme_mentor'),
                    'isactive' => strpos($PAGE->url, '/course/view.php?id=' . $sessioncourse['id']) !== false,
                    'key' => get_string('managesessions', 'theme_mentor'),
                ];
            }
        }

        // Admin link.
        if (is_siteadmin()) {
            $primary[] = [
                'title' => get_string('administrationsite', 'theme_mentor'),
                'url' => new \moodle_url('/admin/search.php'),
                'text' => get_string('administrationsite', 'theme_mentor'),
                'isactive' => strpos($PAGE->url, '/admin/search.php') !== false,
                'key' => get_string('administrationsite', 'theme_mentor')
            ];
        }

        $profile = profile_api::get_profile($USER);
        $presentationpageisenabled = false;
        $contactpageisenabled = false;

        if ($profile->get_main_entity() !== false) {
            $entity = entity_api::get_entity($profile->get_main_entity()->id);
            $presentationpage = $entity->get_presentation_page_course();
            $presentationpageisenabled = $presentationpage !== false && $presentationpage->visible == 1;
            if ($presentationpageisenabled) {
                $presentationpageurl = new \moodle_url('/course/view.php', ['id' => $presentationpage->id]);

                $primary[] = [
                    'title' => get_string('presentation', 'theme_mentor'),
                    'url' => $presentationpageurl,
                    'text' => get_string('presentation', 'theme_mentor'),
                    'isactive' => strpos($PAGE->url, $presentationpageurl) !== false,
                    'key' => get_string('presentation', 'theme_mentor'),
                    'classes' => ['primary_nav_ms_auto']
                ];
            }

            $contactpagecourse = $entity->get_contact_page_course();
            $contactpage = ($contactpagecourse != false) ? $DB->get_record('course_modules', ['course' => $contactpagecourse->id]): false;
            $contactpageisenabled = $contactpage !== false &&  $contactpagecourse->visible == 1;
            if ($contactpageisenabled) {
                $contactpageurl = new \moodle_url('/course/view.php', ['id' => $contactpagecourse->id]);

                $contactpageprimary = [
                    'title' => get_string('contact', 'theme_mentor'),
                    'url' => $contactpageurl,
                    'text' => get_string('contact', 'theme_mentor'),
                    'isactive' => strpos($PAGE->url, $contactpageurl) !== false,
                    'key' => get_string('contact', 'theme_mentor'),
                ];
                if ($presentationpageisenabled === false)
                    $contactpageprimary = array_merge($contactpageprimary, ['classes' => ['primary_nav_ms_auto']]);

                $primary[] = $contactpageprimary;
            }
        }

        $helppageprimary = [
            'title' => get_string('help', 'theme_mentor'),
            'url' => get_config('theme_mentor', 'faq'),
            'text' => get_string('help', 'theme_mentor'),
            'isactive' => strpos($PAGE->url, get_config('theme_mentor', 'faq')) !== false,
            'key' => get_string('help', 'theme_mentor')
        ];
        if ($presentationpageisenabled === false && $contactpageisenabled === false)
            $helppageprimary = array_merge($helppageprimary, ['classes' => ['primary_nav_ms_auto']]);

        $primary[] = $helppageprimary;

        return $primary;
    }

    /**
     * Get/Generate the user menu.
     *
     * This is leveraging the data from user_get_user_navigation_info and the logic in $OUTPUT->user_menu()
     *
     * @param renderer_base $output
     * @return array
     */
    public function get_user_menu(renderer_base $output): array
    {
        global $USER;

        // Add "user profile" link to user menu after divider.
        $usermenu = parent::get_user_menu($output);

        // With not connect user to static page.
        if (!isset($usermenu['items'])) {
            return [];
        }

        $founddividerkey = array_search('divider', array_column($usermenu['items'], 'itemtype'));
        $userprofilelink = (object) [
            'itemtype' => 'user-profile',
            'title' => get_string('profile', 'theme_mentor'),
            'titleidentifier' => 'user,profile',
            'url' => new \moodle_url('/user/profile.php', ['id' => $USER->id]),
            'link' => true,
        ];
        array_splice($usermenu['items'], $founddividerkey + 1, 0, [$userprofilelink]);
        return $usermenu;
    }
}
