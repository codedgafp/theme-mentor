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

use local_mentor_core\session;

/**
 * Extends Moodle renderers
 *
 * @package    theme_mentor
 * @copyright  2020 Edunao SAS (contact@edunao.com)
 * @author     adrien <adrien@edunao.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class theme_mentor_core_renderer extends core_renderer
{

    // Define site types.
    private $types
    = [
        'azure_dev' => 'dev',
        'azure_formation' => 'prod',
        'azure_hotfix' => 'preprod',
        'azure_iso_prod' => 'prod',
        'azure_iso_qualification' => 'qualif',
        'azure_test' => 'dev',
        'dev' => 'dev',
        'developpement' => 'dev',
        'preprod' => 'preprod',
        'preproduction' => 'preprod',
        'pre-production' => 'preprod',
        'prod' => 'prod',
        'production' => 'prod',
        'qualif' => 'qualif',
        'qualification' => 'qualif',
        'test' => 'dev',
    ];

    /**
     * Define if the logo must be displayed
     *
     * @return bool
     */
    public function should_display_navbar_logo()
    {

        // Display the logo on every pages.
        return true;
    }

    /**
     * Return the favicon file url
     *
     * @return moodle_url|string url
     */
    public function favicon()
    {
        global $CFG;

        $filename = 'favicon';

        if (isset($CFG->sitetype) && isset($this->types[$CFG->sitetype]) && $this->types[$CFG->sitetype] != 'prod') {
            $filename .= '_' . $this->types[$CFG->sitetype];

            // Cannot use image_url here because the file name is not favicon.icon.
            return $CFG->wwwroot . '/theme/mentor/pix/' . $filename . '.ico';
        }

        return $this->image_url($filename, 'theme');
    }

    /**
     * Append site type if it's not a production site.
     *
     * @return string
     */
    public function site_type()
    {
        global $CFG;

        $output = '';

        if (isset($CFG->sitetype) && (!isset($this->types[$CFG->sitetype]) ||
            (isset($this->types[$CFG->sitetype]) && $this->types[$CFG->sitetype] != 'prod'))) {

            $type = isset($this->types[$CFG->sitetype]) ? $this->types[$CFG->sitetype] : $CFG->sitetype;
            $output .= '<span id="site-type" class="type-' . $type . '"> ' . $CFG->sitetype . '</span>';
        }
        return $output;
    }

    /**
     * Render the login form.
     *
     * @param \core_auth\output\login $form The renderable.
     * @return string
     * @throws dml_exception
     * @throws moodle_exception
     */
    public function render_login(\core_auth\output\login $form)
    {
        global $CFG, $SITE;

        // Require mentor apis.
        require_once($CFG->dirroot . '/local/mentor_core/api/login.php');

        $context = $form->export_for_template($this);

        // Get about link, if exists.
        $context->aboutlink = get_config('theme_mentor', 'about');

        // Fix the list of enabled auths.
        get_enabled_auth_plugins(true);

        $context->agentconnectenabled = false;

        // Catch agent connect data button.
        foreach ($context->identityproviders as $key => $identityprovider) {
            if ($identityprovider['name'] === get_string('agentconnectname', 'theme_mentor')) {
                $context->agentconnectenabled = true;
                $context->agentconnecturl = $identityprovider['url'];
                $context->agentconnectkey = $key;
            }
        }

        // If there is Agent Connect, unset to "identityproviders" context data.
        if (isset($context->agentconnectkey)) {
            unset($context->identityproviders[$context->agentconnectkey]);
            $context->hasidentityproviders = count($context->identityproviders) > 0;
        }

        if (!empty($CFG->auth)) {
            $authsenabled = explode(',', $CFG->auth);
            if (in_array(get_config('theme_mentor', 'agentconnectidentifier'), $authsenabled)) {
                $context->agentconnectenabled = true;
            }
        }

        // Override because rendering is not supported in template yet.
        $context->rememberusername = $CFG->rememberusername !== '0';
        if (!$context->rememberusername) {
            $context->cookieshelpiconformatted = $this->help_icon('cookiesenabledonlysession');
        } else {
            $context->cookieshelpiconformatted = $this->help_icon('cookiesenabled');
        }
        $context->errorformatted = $this->error_text($context->error);

        // Manage logo.
        $url = $this->get_logo_url();
        if ($url) {
            $url = $url->out(false);
        }
        $context->logourl = $url;

        $context->sitename = format_string(
            $SITE->fullname,
            true,
            ['context' => context_course::instance(SITEID), "escape" => false]
        );
        $context->signupurl = \local_mentor_core\login_api::get_signup_url($context->signupurl);

        $context->mentorpictureurl = $this->image_url('logo-mentor-w', 'theme_mentor');

        $context->username = "";       
        
        // Load the login form template.
        return $this->render_from_template('core/loginform', $context);
    }

    /**
     * Renders the tertiary nav for the participants page
     *
     * This override allow to block enrol any user when session status is completed or achived.
     * 
     * @param object $course The course we are operating within
     * @param string|null $renderedbuttons Any additional buttons/content to be displayed in line with the nav
     * @return string
     */
    public function render_participants_tertiary_nav(object $course, ?string $renderedbuttons = null)
    {
        global $COURSE_SESSION;
        $this->get_course_session();

        if (
            $COURSE_SESSION->status === \local_mentor_core\session::STATUS_COMPLETED ||
            $COURSE_SESSION->status === \local_mentor_core\session::STATUS_ARCHIVED
        ) {
            // hide the enrol button at the bottom of the user/index.php page
            return "<style>.enrolusersbutton {display: none}</style>";
        }

        $actionbar = new \core\output\participants_action_bar($course, $this->page, $renderedbuttons);
        $content = $this->render_from_template('core_course/participants_actionbar', $actionbar->export_for_template($this));
        return $content ?: "";
    }

    /**
     * Get the entity contact page link
     *
     * @return string
     * @throws dml_exception
     * @throws moodle_exception
     */
    public function contact_page()
    {
        global $CFG;
        require_once($CFG->dirroot . '/local/mentor_core/api/profile.php');

        if (isloggedin() && $entity = \local_mentor_core\profile_api::get_user_main_entity()) {
            // Check if contact page is initiliazed.
            if ($entity->contact_page_is_initialized()) {
                return $entity->get_contact_page_url();
            }
        }
        return '';
    }

    /**
     * Get text information footer.
     *
     * @return false|string|null
     * @throws dml_exception
     */
    public function textinfofooter_page()
    {
        return get_config('theme_mentor', 'textinfofooter');
    }

    /**
     * Get about page link, if set.
     *
     * @return false|string|null
     * @throws dml_exception
     */
    public function about_page()
    {
        return get_config('theme_mentor', 'about');
    }

    /**
     * Get legal notice page link, if set.
     *
     * @return false|string|null
     * @throws dml_exception
     */
    public function legalnotice_page()
    {
        return get_config('theme_mentor', 'legalnotice');
    }


    /**
     * Get contact page for non logged in users, if set.
     *
     * @return false|string|null
     * @throws dml_exception
     */
    public function non_logged_contact_page()
    {   
        if(!isloggedin()){
            return get_config('theme_mentor', 'nonloggedcontact');
        }
        
    }

    /**
     * Get FAQ page link, if set.
     *
     * @return false|string|null
     * @throws dml_exception
     */
    public function faq_page()
    {
        return get_config('theme_mentor', 'faq');
    }

    /**
     * Get Mentor version number, if set.
     *
     * @return false|string|null
     * @throws coding_exception
     * @throws dml_exception
     * @throws moodle_exception
     */
    public function versionnumber_page()
    {

        $managedentities = \local_mentor_core\entity_api::count_managed_entities(null, false);

        if (!is_siteadmin() && $managedentities == 0) {
            return '';
        }

        return get_config('theme_mentor', 'versionnumber');
    }

    /**
     * Get Mentor licence, if set.
     *
     * @return false|string|null
     * @throws dml_exception
     */
    public function mentorlicence_page()
    {
        return get_config('theme_mentor', 'mentorlicence');
    }

    /**
     * Get external links.
     *
     * @return string[]
     * @throws dml_exception
     */
    public function externallink_page()
    {
        return explode("|", get_config('theme_mentor', 'externallinks'));
    }

    /**
     * Get Site Map page link, if set.
     *
     * @return false|string|null
     * @throws dml_exception
     */
    public function sitemap_page()
    {
        return get_config('theme_mentor', 'sitemap');
    }

    /**
     * Get Accessibility page link, if set.
     *
     * @return false|string|null
     * @throws dml_exception
     */
    public function accessibility_page()
    {
        return get_config('theme_mentor', 'accessibility');
    }

    /**
     * Get Personal Data page link, if set.
     *
     * @return false|string|null
     * @throws dml_exception
     */
    public function personaldata_page()
    {
        return get_config('theme_mentor', 'personaldata');
    }

    /**
     * Get url logo.
     *
     * @return false|string|null
     * @throws dml_exception
     */
    public function urllogo_page()
    {
        return $this->get_logo_url();
    }

    /**
     * Get if user is logged
     */
    public function islogged_page()
    {
        return isloggedin();
    }

    /**
     * Override the header to add jquery.
     *
     * @return string
     * @throws coding_exception
     */
    public function header()
    {
        global $CFG;

        // Add jquery and jquery ui.
        $this->page->requires->jquery();
        $this->page->requires->jquery_plugin('ui');
        $this->page->requires->jquery_plugin('ui-css');

        // Add a body class if the current course page is a demo.
        if ($this->page->course->id != 1) {
            require_once($CFG->dirroot . '/local/mentor_core/api/training.php');
            require_once($CFG->dirroot . '/local/mentor_core/api/library.php');

            $training = \local_mentor_core\training_api::get_training_by_course_id($this->page->course->id);
            if ($training && $training->is_from_library()) {
                $this->page->add_body_class('demo-course');
            }
        }
        return parent::header();
    }

    /**
     * Add the status into the course header
     *
     * @return string
     * @throws coding_exception
     * @throws dml_exception
     * @throws moodle_exception
     */
    public function course_header()
    {
        global $COURSE, $USER;

        $header = parent::course_header();

        // Check if the current course is not the frontpage.
        if ($COURSE->id == 1) {
            return $header;
        }

        // Get session status.
        if ($session = $this->get_course_session()) {
            if (
                !has_capability('moodle/course:update', $session->get_context(), $USER) &&
                !$session->is_tutor($USER)
                &&
                (
                    $session->status === \local_mentor_core\session::STATUS_IN_PREPARATION ||
                    $session->status === \local_mentor_core\session::STATUS_OPENED_REGISTRATION
                )
            ) {
                redirect(new \moodle_url('/theme/mentor/pages/unavailable_session.php', ['id' => $COURSE->id]));
            }

            // Does not display the status of the current session if it is permanent and "in progress" for user participant.
            if (
                $session->status !== \local_mentor_core\session::STATUS_IN_PROGRESS ||
                !$session->is_participant($USER) ||
                $session->sessionpermanent !== '1'
            ) {
                $header .= '<div id="course-status">' . get_string($session->status, 'local_session') . '</div>';
            }

            // Get training status.
        } else if ($training = \local_mentor_core\training_api::get_training_by_course_id($COURSE->id)) {
            if ($training->is_from_library()) {
                $header .= '<div id="course-status">Démo</div>';
            } else {
                $header .= '<div id="course-status">' . get_string($training->status, 'local_trainings') . '</div>';
            }
        }

        return $header;
    }

    private function get_course_session(): session | bool
    {
        global $COURSE, $COURSE_SESSION;
        if (!$COURSE_SESSION) $COURSE_SESSION = \local_mentor_core\session_api::get_session_by_course_id($COURSE->id);
        return $COURSE_SESSION;
    }

    /**
     * The standard tags (typically performance information and validation links,
     * if we are in developer debug mode) that should be output in the footer area
     * of the page. Designed to be called in theme layout.php files.
     *
     * @return string HTML fragment.
     */
    public function standard_footer_html()
    {
        global $CFG;

        require_once($CFG->dirroot . '/local/mentor_core/lib.php');

        $output = parent::standard_footer_html();
        return local_mentor_core_get_footer_specialization($output);
    }

    /**
     * Wrapper for header elements.
     *
     * @return string HTML to display the main header.
     * @throws coding_exception
     * @throws dml_exception
     * @throws moodle_exception
     */
    public function full_header()
    {

        if (
            $this->page->include_region_main_settings_in_header_actions() &&
            !$this->page->blocks->is_block_present('settings')
        ) {
            // Only include the region main settings if the page has requested it and it doesn't already have
            // the settings block on it. The region main settings are included in the settings block and
            // duplicating the content causes behat failures.
            $this->page->add_header_action(html_writer::div(
                $this->region_main_settings_menu(),
                'd-print-none',
                ['id' => 'region-main-settings-menu']
            ));
        }

        $header = new stdClass();
        $header->settingsmenu = $this->context_header_settings_menu();
        $header->contextheader = $this->context_header();
        $header->hasnavbar = empty($this->page->layout_options['nonavbar']);
        $header->navbar = $this->navbar();
        $header->pageheadingbutton = $this->page_heading_button();
        $header->courseheader = $this->course_header();
        $header->headeractions = $this->page->get_header_actions();

        $header->hasprevbutton = 0;

        if ($this->page->has_set_url()) {

            // Back to the course for activity.
            if (strpos($this->page->url, '/mod/') !== false && $this->page->course->format != 'singleactivity') {
                $header->hasprevbutton = 1;
                $header->prevstepurl = (new moodle_url('/course/section.php',
                                            ['id' => $this->page->cm->sectionid]
                                        ))->out();
                $header->prevstetitle = get_string('exittomod', 'theme_mentor');
            }

            // Back to the catalog for training catalog.
            if (strpos($this->page->url, '/local/catalog/pages/') !== false) {
                $header->hasprevbutton = 1;
                $header->prevstepurl = (new moodle_url('/local/catalog/index.php'))->out();
                $header->prevstetitle = get_string('prevstepcatalog', 'theme_mentor');
            }

            // Back to the dashboard for training sheet.
            if (strpos($this->page->url, '/local/trainings/pages/training.php') !== false) {
                $header->hasprevbutton = 1;
                $header->prevstepurl = (new moodle_url('/'))->out();
                $header->prevstetitle = get_string('prevstepdashboard', 'theme_mentor');
            }

            // Back to the training sheet page.
            if (strpos($this->page->url, '/local/trainings/pages/preview.php') !== false) {
                $trainingid = required_param('trainingid', PARAM_INT);
                $header->hasprevbutton = 1;
                $header->prevstepurl = (new moodle_url(
                    '/local/trainings/pages/update_training.php',
                    ['trainingid' => $trainingid]
                ))->out();
                $header->prevstetitle = get_string('closetrainingpreview', 'local_trainings');
            }

            // Back to the library page.
            if (strpos($this->page->url, '/local/library/pages/training.php') !== false) {
                $header->hasprevbutton = 1;
                $header->prevstepurl = (new moodle_url('/local/library/index.php'))->out();
                $header->prevstetitle = get_string('libraryreturn', 'theme_mentor');
            }
        }

        return $this->render_from_template('core/full_header', $header);
    }

    public function firstview_fakeblocks()
    {
        return;
    }

    /**
     * Create a navbar switch for toggling editing mode.
     *
     * @return string Html containing the edit switch
     */
    public function edit_switch()
    {
        $course = $this->page->course;

        // If is course.
        if ($course && $course->id !== SITEID) {
            $training = \local_mentor_core\training_api::get_training_by_course_id($course->id);
            $session = \local_mentor_core\session_api::get_session_by_course_id($course->id);

            // If the course is linked to a training or session.
            if ($training || $session) {
                return parent::edit_switch();
            }
        }

        // If is admin and user is in default dashbord.
        if (is_siteadmin()) {
            if (strpos($this->page->url, '/my/indexsys.php') !== false) {
                return parent::edit_switch();
            }
        }

        // If admin or entity manager is in presentation page.
        if (theme_mentor_is_in_mentor_page()) {
            $entity = \local_mentor_core\entity_api::get_entity($this->page->category->parent);
            $presentationpage = $entity->get_presentation_page_course();
            if (
                has_capability('local/entities:manageentity', $entity->get_context()) && $presentationpage &&
                $presentationpage->id === $this->page->course->id
            ) {
                return parent::edit_switch();
            }
        }
    }

    /**
     * The standard tags (typically script tags that are not needed earlier) that
     * should be output after everything else. Designed to be called in theme layout.php files.
     *
     * @return string HTML fragment.
     */
    public function standard_end_of_body_html()
    {
        $output = parent::standard_end_of_body_html();

        $url = $this->page->url;

        if ((strpos($url, '/my/') || strpos($url, '/login/index.php')) !== false) {
            $output .= "\n" . get_config('theme_mentor', 'rizomobodytag');
        }

        return $output;
    }

    /**
     * Custom standard main content placeholder.
     * Designed to be called in theme layout.php files.
     *
     * @return string HTML fragment.
     */
    public function main_content() {
        // This is here because it is the only place we can inject the "main" role over the entire main content area
        // without requiring all theme's to manually do it, and without creating yet another thing people need to
        // remember in the theme.
        // This is an unfortunate hack. DO NO EVER add anything more here.
        // DO NOT add classes.
        // DO NOT add an id.

        $url = $this->page->url;
        $balise = strpos($url, '/my/') ? "div" : "main";

        $main_content = "<$balise role='main'>" . $this->unique_main_content_token . "</$balise>";
        return $main_content;
    }

    /**
     * Renders a custom static link (e.g., "About Us") with an icon if the user is not logged in.
     *
     * @return string HTML for the static link.
     */
    public function render_custom_static_head_links(): string {
        global $PAGE;
        $links = '<div class="custom-static-head-links-group">';
        if ($PAGE->url && strpos($PAGE->url->get_path(), 'login/index.php') && !isloggedin() || isguestuser()) {
            
            $openli = '<li class="nav-item">';
            $closeli = '</li>';
            
            $catalogicone = '<i class="fa fa-list" aria-hidden="true"></i>';
            $cataloglabel = get_string('discovertrainingsoffer', 'theme_mentor');
            $cataloglink = $openli . '<a href="/offre" class="nav-link fr-btn fr-icon-file-text-line custom-static-head-links align-items-center">'. $catalogicone . ' ' . $cataloglabel . '</a>' . $closeli;
            $links .= $cataloglink;

            $abouticone = '<i class="fa fa-question-circle-o ms-2" aria-hidden="true"></i> ';
            $aboutlabel = get_string('about', 'theme_mentor');
            $aboutlink = $openli . '<a href="/local/staticpage/view.php?page=ensavoirplus" class="nav-link custom-static-head-links">'. $abouticone . ' ' . $aboutlabel . ' </a>' . $closeli;
            $links .= $aboutlink;   
        }
        $links.= '</div>';
        return $links;
    }
    /**
     * Render disabled managespaces link for RFC and RLF
     * 
     */
    public function navbar() {
        global $USER;

        if(isloggedin())
        {
            $navbar = $this->page->navbar;
            $items = $navbar->get_items();
            
            $course = $this->page->course;
            if( $course && isset($course->format)){
                $courseFormat = $course->format;
                if (!in_array($courseFormat, ['site', 'edadmin'])){
                    $filtered = [];
                   
                    if(!empty($items)) {
                        $filtered[] = reset($items);
                    }
                    foreach($items as $item){
                        if($course->id == $item->key || isset($filtered[1])){
                            $filtered[] =  $item;
                        }
                    }
                    $items = $filtered;
                }
            }
                
            foreach ($items as $item) {
                if ($this->has_role_unauthorized_to_managespaces($USER) && $item->text === get_string('managespaces', 'format_edadmin')) {
                    $item->action = null;
                }
            }    

           $context['get_items'] = $items;
            return $this->render_from_template('core/navbar', $context);
        }      
    }

    public function has_role_unauthorized_to_managespaces($user): bool {
        $highestrole = \local_mentor_core\profile_api::get_highest_role_by_user($user->id);
     
        $elevatedroles = ['respformation', 'referentlocal', 'reflocalnonediteur'];

        if (!is_object($highestrole) || !isset($highestrole->shortname)) {
            return false;
        }

        return in_array($highestrole->shortname, $elevatedroles);
    }

    /**
     * Renders the context header for the page.
     *
     * @param array $headerinfo Heading information.
     * @param int $headinglevel What 'h' level to make the heading.
     * @return string A rendered context header.
     */
    public function context_header($headerinfo = null, $headinglevel = 1): string {
        global $DB;

        $context = $this->page->context;
        $heading = null;
        $imagedata = null;
        $userbuttons = null;
        $prefix = null;

        if ($context->contextlevel == CONTEXT_COURSE) {
            $heading = $this->page->course->shortname;
        }

        $contextheader = new \context_header($heading, $headinglevel, $imagedata, $userbuttons, $prefix);
        return $this->render($contextheader);
    }
}
