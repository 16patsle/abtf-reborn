<?php
/**
 * Website monitor admin controller
 *
 * @package    optimization
 * @subpackage optimization/admin
 * @author     Optimization.Team <info@optimization.team>
 * @author     Patrick Sletvold
 */

class ABTFR_Admin_Monitor {
    /**
     * Advanced optimization controller
     */
    public $CTRL;

    /**
     * Options
     */
    public $options;

    /**
     * Initialize the class and set its properties
     */
    public function __construct(&$CTRL) {
        $this->CTRL = &$CTRL;
        $this->options = &$CTRL->options;

        /**
         * Admin panel specific
         */
        if (is_admin()) {
            /**
             * Handle form submissions
             */
            $this->CTRL->loader->add_action(
                'admin_post_abtfr_monitor_update',
                $this,
                'update_settings'
            );
            // Legacy version
            $this->CTRL->loader->add_action(
                'admin_post_abtfr-monitor-update',
                $this,
                'update_settings'
            );
        }
    }

    /**
     * Update settings
     */
    public function update_settings() {
        check_admin_referer('abtfr');

        // @link https://codex.wordpress.org/Function_Reference/stripslashes_deep
        $_POST = array_map('stripslashes_deep', $_POST);

        $options = get_option('abtfr');
        if (!is_array($options)) {
            $options = array();
        }

        // input
        $input =
            isset($_POST['ao']) && is_array($_POST['ao'])
                ? $_POST['ao']
                : array();

        // update settings
        //$this->CTRL->admin->save_settings($options, 'Proxy settings saved.');

        wp_redirect(
            add_query_arg(array('page' => 'abtfr'), admin_url('admin.php')) .
                '#/monitor'
        );
        exit();
    }
}
