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
 * myprofile renderer.
 *
 * @package    core_user
 * @copyright  2015 onwards Ankit Agarwal <ankit.agrr@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace theme_mentor\output\core_user\myprofile;

defined('MOODLE_INTERNAL') || die;
/**
 * Report log renderer's for printing reports.
 *
 * @since      Moodle 2.9
 * @package    core_user
 * @copyright  2015 onwards Ankit Agarwal <ankit.agrr@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class renderer extends \core_user\output\myprofile\renderer {

    /**
     * Render a category.
     *
     * @param \core_user\output\myprofile\category $category
     *
     * @return string
     */
    public function render_category(\core_user\output\myprofile\category $category) {
        $classes = $category->classes;
        if (empty($classes)) {
            $return = \html_writer::start_tag('section',
                array('class' => 'node_category card d-inline-block w-100 mb-3'));
            $return .= \html_writer::start_tag('div', array('class' => 'card-body'));
        } else {
            $return = \html_writer::start_tag('section',
                array('class' => 'node_category card d-inline-block w-100 mb-3' . $classes));
            $return .= \html_writer::start_tag('div', array('class' => 'card-body'));
        }
        $return .= \html_writer::tag('h3', $category->title, array('class' => 'lead'));
        $nodes = $category->nodes;
        if (empty($nodes)) {
            // No nodes, nothing to render.
            return '';
        }
        // Check if there are description lists.
        $desclist = true;
        foreach ($nodes as $node) {
            if (is_object($node->url)) {
                $header = \html_writer::link($node->url, $node->title);
            } else {
                $header = $node->title;
            }
            $icon = $node->icon;
            if (!empty($icon)) {
                $header .= $this->render($icon);
            }
            $content = $node->content;
            if (empty($header) || empty($content)) {
                $desclist = false;
                break;
            }
        }
        if ($desclist) {
            $return .= \html_writer::start_tag('dl');
        } else {
            $return .= \html_writer::start_tag('ul');
        }
        foreach ($nodes as $node) {
            $return .= $this->render_node($node, $desclist);
        }
        if ($desclist) {
            $return .= \html_writer::end_tag('dl');
        } else {
            $return .= \html_writer::end_tag('ul');
        }
        $return .= \html_writer::end_tag('div');
        $return .= \html_writer::end_tag('section');
        return $return;
    }

    /**
     * Render a node.
     *
     * @param \core_user\output\myprofile\node $node
     *
     * @return string
     */
    public function render_node(\core_user\output\myprofile\node $node, $desclist = false) {
        $return = '';
        if (is_object($node->url)) {
            $header = \html_writer::link($node->url, $node->title);
        } else {
            $header = $node->title;
        }
        $icon = $node->icon;
        if (!empty($icon)) {
            $header .= $this->render($icon);
        }
        $content = $node->content;
        $classes = $node->classes;
        if (!empty($content)) {
            if ($header) {
                // There is some content to display below this make this a header.
                $return = \html_writer::tag('dt', $header);
                $return .= \html_writer::tag('dd', $content);

                if (!$desclist) {
                    $return = \html_writer::tag('dl', $return);
                }
            } else {
                $return = \html_writer::span($content);
            }
            if (!$desclist) {
                if ($classes) {
                    $return = \html_writer::tag('li', $return, array('class' => 'contentnode ' . $classes));
                } else {
                    $return = \html_writer::tag('li', $return, array('class' => 'contentnode'));
                }
            }
        } else {
            $return = \html_writer::span($header);
            $return = \html_writer::tag('li', $return, array('class' => $classes));
        }

        return $return;
    }
}
