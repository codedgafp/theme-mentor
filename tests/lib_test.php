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
 * Theme mentor lib tests
 *
 * @package    theme_mebtor
 * @copyright  2023 Edunao SAS (contact@edunao.com)
 * @author     rcolet <remi.colet@edunao.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;

require_once($CFG->dirroot . '/theme/mentor/lib.php');

class theme_mentor_lib_testcase extends advanced_testcase {

    /**
     * theme_mentor_get_previous_button not set url
     *
     * @covers ::theme_mentor_get_previous_button
     */
    public function test_theme_mentor_get_previous_button_nok_not_set_url() {
        $this->resetAfterTest(true);

        self::assertFalse(theme_mentor_get_previous_button());

        self::resetAllData();
    }

    /**
     * theme_mentor_get_previous_button not good url
     *
     * @covers ::theme_mentor_get_previous_button
     */
    public function test_theme_mentor_get_previous_button_nok_not_good_url() {
        global $PAGE;

        $this->resetAfterTest(true);

        // Set url to dashboard.
        $PAGE->set_url('/');

        self::assertFalse(theme_mentor_get_previous_button());

        self::resetAllData();
    }

    /**
     * theme_mentor_get_previous_button to mod
     *
     * @covers ::theme_mentor_get_previous_button
     */
    public function test_theme_mentor_get_previous_button_ok_to_mod() {
        global $PAGE, $CFG;

        $this->resetAfterTest(true);

        // Set course and activity.
        $course = self::getDataGenerator()->create_course(['format' => 'topics']);
        $forum = $this->getDataGenerator()->create_module('forum', ['course' => $course->id]);
        $cm = get_coursemodule_from_id('forum', $forum->cmid);

        // Set PAGE.
        $PAGE->set_course($course);
        $PAGE->set_url('/mod/falsemod');
        $PAGE->set_cm($cm);

        // Get previous buttons.
        $previousbutton = theme_mentor_get_previous_button();

        self::assertIsObject($previousbutton);
        self::assertObjectHasProperty('prevstepurl', $previousbutton);
        self::assertEquals(
            $CFG->wwwroot . '/course/view.php?id=' . $course->id . '&section=0',
            $previousbutton->prevstepurl
        );
        self::assertObjectHasProperty('prevstetitle', $previousbutton);
        self::assertEquals(get_string('exittomod', 'theme_mentor'), $previousbutton->prevstetitle);

        self::resetAllData();
    }

    /**
     * theme_mentor_get_previous_button to training catalog
     *
     * @covers ::theme_mentor_get_previous_button
     */
    public function test_theme_mentor_get_previous_button_ok_to_training_catalog() {
        global $PAGE, $CFG;

        $this->resetAfterTest(true);

        // Set url to false training catalog.
        $PAGE->set_url('/local/catalog/pages/training.php');

        $previousbutton = theme_mentor_get_previous_button();

        self::assertIsObject($previousbutton);
        self::assertObjectHasProperty('prevstepurl', $previousbutton);
        self::assertEquals(
            $CFG->wwwroot . '/local/catalog/index.php',
            $previousbutton->prevstepurl
        );
        self::assertObjectHasProperty('prevstetitle', $previousbutton);
        self::assertEquals(get_string('prevstepcatalog', 'theme_mentor'), $previousbutton->prevstetitle);

        self::resetAllData();
    }

    /**
     * theme_mentor_get_previous_button to training sheet
     *
     * @covers ::theme_mentor_get_previous_button
     */
    public function test_theme_mentor_get_previous_button_ok_to_training_sheet() {
        global $PAGE, $CFG;

        $this->resetAfterTest(true);

        // Set url to false training sheet.
        $PAGE->set_url('/local/trainings/pages/training.php');

        $previousbutton = theme_mentor_get_previous_button();

        self::assertIsObject($previousbutton);
        self::assertObjectHasProperty('prevstepurl', $previousbutton);
        self::assertEquals(
            $CFG->wwwroot . '/',
            $previousbutton->prevstepurl
        );
        self::assertObjectHasProperty('prevstetitle', $previousbutton);
        self::assertEquals(get_string('prevstepdashboard', 'theme_mentor'), $previousbutton->prevstetitle);

        self::resetAllData();
    }

    /**
     * theme_mentor_get_previous_button to training sheet page
     *
     * @covers ::theme_mentor_get_previous_button
     */
    public function test_theme_mentor_get_previous_button_ok_to_training_sheet_page() {
        global $PAGE, $CFG;

        $this->resetAfterTest(true);

        $falsetrainingid = 10;

        // Set url to false training sheet page.
        $PAGE->set_url('/local/trainings/pages/preview.php', ['trainingid' => $falsetrainingid]);
        $_POST['trainingid'] = $falsetrainingid;

        $previousbutton = theme_mentor_get_previous_button();

        self::assertIsObject($previousbutton);
        self::assertObjectHasProperty('prevstepurl', $previousbutton);
        self::assertEquals(
            $CFG->wwwroot . '/local/trainings/pages/update_training.php?trainingid=' . $falsetrainingid,
            $previousbutton->prevstepurl
        );
        self::assertObjectHasProperty('prevstetitle', $previousbutton);
        self::assertEquals(get_string('closetrainingpreview', 'local_trainings'), $previousbutton->prevstetitle);

        self::resetAllData();
    }

    /**
     * theme_mentor_get_previous_button to library page
     *
     * @covers ::theme_mentor_get_previous_button
     */
    public function test_theme_mentor_get_previous_button_ok_to_library_page() {
        global $PAGE, $CFG;

        $this->resetAfterTest(true);

        // Set url to false library page.
        $PAGE->set_url('/local/library/pages/training.php');

        $previousbutton = theme_mentor_get_previous_button();

        self::assertIsObject($previousbutton);
        self::assertObjectHasProperty('prevstepurl', $previousbutton);
        self::assertEquals(
            $CFG->wwwroot . '/local/library/index.php',
            $previousbutton->prevstepurl
        );
        self::assertObjectHasProperty('prevstetitle', $previousbutton);
        self::assertEquals(get_string('libraryreturn', 'theme_mentor'), $previousbutton->prevstetitle);

        self::resetAllData();
    }

    /**
     * theme_mentor_has_course_index not ok format remui
     *
     * @covers ::theme_mentor_has_course_index
     */
    public function test_theme_mentor_has_course_index_nok_format_remui() {
        global $PAGE;

        $this->resetAfterTest(true);

        // Create course.
        $course = self::getDataGenerator()->create_course();

        // Set PAGE.
        $PAGE->set_course($course);
        $PAGE->course->format = 'remuiformat';

        self::assertFalse(theme_mentor_has_course_index());

        self::resetAllData();
    }

    /**
     * theme_mentor_has_course_index not ok format tiles
     *
     * @covers ::theme_mentor_has_course_index
     */
    public function test_theme_mentor_has_course_index_nok_format_tiles() {
        global $PAGE;

        $this->resetAfterTest(true);

        // Create course.
        $course = self::getDataGenerator()->create_course();

        // Set PAGE.
        $PAGE->set_course($course);
        $PAGE->course->format = 'tiles';

        self::assertFalse(theme_mentor_has_course_index());

        self::resetAllData();
    }

    /**
     * theme_mentor_has_course_index not ok has completion progress block.
     *
     * @covers ::theme_mentor_has_course_index
     */
    public function test_theme_mentor_has_course_index_nok_has_completion_progess_block() {
        global $PAGE, $DB;

        $this->resetAfterTest(true);

        // Create course.
        $course = self::getDataGenerator()->create_course();

        // Get course context.
        $coursecontext = \context_course::instance($course->id);

        // Set PAGE.
        $PAGE->set_course($course);

        // Add false block to database.
        $DB->insert_record(
            'block_instances',
            [
                'blockname' => 'completion_progress',
                'parentcontextid' => $coursecontext->id,
                'showinsubcontexts' => 0,
                'defaultweight' => 0,
                'pagetypepattern' => 'my-index',
                'subpagepattern' => 2,
                'timecreated' => time(),
                'timemodified' => time(),
            ]
        );

        self::assertFalse(theme_mentor_has_course_index());

        self::resetAllData();
    }

    /**
     * theme_mentor_has_course_index not ok no section.
     *
     * @covers ::theme_mentor_has_course_index
     */
    public function test_theme_mentor_has_course_index_nok_no_section() {
        global $PAGE;

        $this->resetAfterTest(true);

        // Create course.
        $course = self::getDataGenerator()->create_course(['numsections' => 0]);

        // Set PAGE.
        $PAGE->set_course($course);

        self::assertFalse(theme_mentor_has_course_index());

        self::resetAllData();
    }

    /**
     * theme_mentor_has_course_index not ok one section.
     *
     * @covers ::theme_mentor_has_course_index
     */
    public function test_theme_mentor_has_course_index_nok_one_section() {
        global $PAGE;

        $this->resetAfterTest(true);

        // Create course.
        $course = self::getDataGenerator()->create_course(['numsections' => 1]);

        // Set PAGE.
        $PAGE->set_course($course);

        self::assertFalse(theme_mentor_has_course_index());

        self::resetAllData();
    }

    /**
     * theme_mentor_has_course_index not has summary block.
     *
     * @covers ::theme_mentor_has_course_index
     */
    public function test_theme_mentor_has_course_index_nok_has_summary_block() {
        global $PAGE, $DB;

        $this->resetAfterTest(true);

        // Create course.
        $course = self::getDataGenerator()->create_course(
            ['format' => 'topics', 'numsections' => 2]
        );

        // Get course context.
        $coursecontext = \context_course::instance($course->id);

        // Add false block to database.
        $DB->insert_record(
            'block_instances',
            [
                'blockname' => 'summary',
                'parentcontextid' => $coursecontext->id,
                'showinsubcontexts' => 0,
                'defaultweight' => 0,
                'pagetypepattern' => 'my-index',
                'subpagepattern' => 2,
                'timecreated' => time(),
                'timemodified' => time(),
            ]
        );

        // Set PAGE.
        $PAGE->set_course($course);

        self::assertFalse(theme_mentor_has_course_index());

        self::resetAllData();
    }

    /**
     * theme_mentor_has_course_index not has summary block.
     *
     * @covers ::theme_mentor_has_course_index
     */
    public function test_theme_mentor_has_course_index_nok_course_display_option() {
        global $PAGE, $DB;

        $this->resetAfterTest(true);

        // Create course.
        $course = self::getDataGenerator()->create_course(
            ['format' => 'topics', 'numsections' => 2]
        );

        // Set PAGE.
        $PAGE->set_course($course);

        // Set course display option.
        $courseformatoptions = $DB->get_record(
            'course_format_options',
            [
                'courseid' => $course->id,
                'format' => 'topics',
                'name' => 'coursedisplay',
            ]
        );
        $courseformatoptions->value = 0;

        $DB->update_record('course_format_options', $courseformatoptions);

        self::assertFalse(theme_mentor_has_course_index());

        self::resetAllData();
    }

    /**
     * theme_mentor_has_course_index ok.
     *
     * @covers ::theme_mentor_has_course_index
     */
    public function test_theme_mentor_has_course_index_ok() {
        global $PAGE, $DB;

        $this->resetAfterTest(true);

        // Create course.
        $course = self::getDataGenerator()->create_course(
            ['format' => 'topics', 'numsections' => 2]
        );

        // Set PAGE.
        $PAGE->set_course($course);

        // Set course display option.
        $courseformatoptions = $DB->get_record(
            'course_format_options',
            [
                'courseid' => $course->id,
                'format' => 'topics',
                'name' => 'coursedisplay',
            ]
        );
        $courseformatoptions->value = 1;
        $DB->update_record('course_format_options', $courseformatoptions);

        self::assertTrue(theme_mentor_has_course_index());

        self::resetAllData();
    }

    /**
     * theme_mentor_is_in_mentor_page.
     *
     * @covers ::theme_mentor_is_in_mentor_page
     */
    public function test_theme_mentor_theme_mentor_is_in_mentor_page() {
        global $PAGE;

        $this->resetAfterTest(true);

        // In course category.
        $PAGE = new stdClass();
        $PAGE->context = new stdClass();
        $PAGE->context->contextlevel = CONTEXT_COURSECAT;
        self::assertFalse(theme_mentor_is_in_mentor_page());

        // Category course name is not "Pages".
        $PAGE->context->contextlevel = CONTEXT_COURSE;
        $PAGE->category = new stdClass();
        $PAGE->category->name = 'Not Pages';
        self::assertFalse(theme_mentor_is_in_mentor_page());

        // Course format is "site".
        $PAGE->category->name = "Pages";
        $PAGE->course = new stdClass();
        $PAGE->course->format = "site";
        self::assertFalse(theme_mentor_is_in_mentor_page());

        // Course format is "edadmin".
        $PAGE->category->name = "Pages";
        $PAGE->course = new stdClass();
        $PAGE->course->format = "edadmin";
        self::assertFalse(theme_mentor_is_in_mentor_page());

        // All condition is OK.
        $PAGE->category->name = "Pages";
        $PAGE->course = new stdClass();
        $PAGE->course->format = "topics";
        self::assertTrue(theme_mentor_is_in_mentor_page());

        self::resetAllData();
    }
}
