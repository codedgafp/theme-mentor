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
 * Database upgrades for the theme mentor.
 *
 * @package   theme_mentor
 * @copyright  2023 Edunao SAS (contact@edunao.com)
 * @author    remi <remi.colet@edunao.com>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL
 */

/**
 * Upgrade the local_trainings database.
 *
 * @param int $oldversion The version number of the plugin that was installed.
 * @return boolean
 */
function xmldb_theme_mentor_upgrade($oldversion) {
    if ($oldversion < 2023063000) {
        // Update config.
        set_config(
            'mentorlicence',
            'Sauf mention contraire, tous les contenus de ce site sont sous ' .
            '<a href= "https://www.etalab.gouv.fr/" target="_blank"> licence etalab - 2.0</a >',
            'theme_mentor'
        );
    }

    return true;
}
