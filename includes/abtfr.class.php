<?php

/**
 * ABTFR optimization core class.
 *
 * This class provides the functionality for admin dashboard and WordPress hooks.
 *
 * @since      1.0
 * @package    abtfr
 * @subpackage abtfr/includes
 * @author     Optimization.Team <info@optimization.team>
 */

class ABTFR {
    /**
     * The loader that's responsible for maintaining and registering all hooks that power
     * the plugin
     */
    public $loader;

    /**
     * The unique identifier of this plugin
     */
    public $plugin_name;

    /**
     * The current version of the plugin
     */
    protected $version;

    /**
     * Disable abtfr optimization
     */
    public $disabled = false;

    /**
     * Special view (e.g. full css export and critical css quality tester)
     */
    public $view = false;

    /**
     * Options
     */

    public $options;

    /**
     * Sub-controllers
     */
    public $admin;
    public $optimization;
    public $plugins;
    public $gwfo;
    public $proxy;
    public $lazy;

    /**
     * cURL controller
     */
    public $curl;

    /**
     * Template redirect hook called
     */
    public $template_redirect_called = false;

    /**
     * Construct and initiated ABTFR class
     */
    public function __construct() {
        global $show_admin_bar;

        // set plugin meta
        $this->plugin_name = 'abtfr';
        $this->version = WPABTFR_VERSION;

        /**
         * Disable plugin in admin or for testing
         */
        if (!$this->is_enabled()) {
            $this->disabled = true;
        }

        /**
         * Register Activate / Deactivate hooks.
         */
        register_activation_hook(WPABTFR_SELF, array($this, 'activate'));
        register_deactivation_hook(WPABTFR_SELF, array($this, 'deactivate'));

        /**
         * Special Views
         */

        // a hash is used to prevent random traffic or abuse
        $view_hash = md5(SECURE_AUTH_KEY . AUTH_KEY);

        // available views
        $views = array(
            // extract full CSS view
            'extract-css' => array('admin_bar' => false),

            // critical CSS quality test and editor
            'critical-css-editor' => array(
                'admin_bar' => false,
                'nohash' => true
            ),

            // view website with just the critical CSS
            'critical-css-view' => array(
                'admin_bar' => false,
                'nohash' => true
            ),

            // view website regularly, but without the admin toolbar for comparison view
            'full-css-view' => array('admin_bar' => false, 'nohash' => true),

            // build tool HTML export for Gulp.js critical task
            'abtfr-buildtool-html' => array('admin_bar' => false),

            // build tool full css export for Gulp.js critical task
            'abtfr-buildtool-css' => array('admin_bar' => false),

            // external resource proxy
            'abtfr-proxy' => array()
        );
        foreach ($views as $viewKey => $viewSettings) {
            // check if view is active
            if (isset($_REQUEST[$viewKey])) {
                if (
                    (!isset($viewSettings['nohash']) ||
                        !$viewSettings['nohash']) &&
                    $_REQUEST[$viewKey] !== $view_hash
                ) {
                    continue;
                }

                // set view
                $this->view = $viewKey;

                // hide admin bar
                if (
                    isset($viewSettings['admin_bar']) &&
                    $viewSettings['admin_bar'] === false
                ) {
                    $show_admin_bar = false;
                }
            }
        }

        // load dependencies
        $this->load_dependencies();

        // Load WordPress hook/filter loader
        $this->loader = new ABTFR_Loader();

        // set language
        $this->set_locale();

        /**
         * Load options
         */
        $this->options = get_option('abtfr');

        // load Google PWA optimization controller
        $this->pwa = new ABTFR_PWA($this);

        // load HTTP/2 optimization controller
        $this->http2 = new ABTFR_HTTP2($this);

        // load webfont optimization controller
        $this->gwfo = new ABTFR_WebFonts($this);

        /**
         * External resource proxy
         */
        $this->proxy = new ABTFR_Proxy($this);

        /**
         * Load admin controller
         */
        $this->admin = new ABTFR_Admin($this);

        // do not load rest of plugin for proxy
        if ($this->view === 'abtfr-proxy') {
            return;
        }

        // plugin module controller
        $this->plugins = new ABTFR_Plugins($this);
        $this->plugins->load_modules();

        /**
         * Critical CSS optimization controller
         */
        $this->criticalcss = new ABTFR_Critical_CSS($this);

        // load optimization controller
        $this->optimization = new ABTFR_Optimization($this);

        // load lazy script loading module
        $this->lazy = new ABTFR_LazyScripts($this);

        /**
         * Use ABTF Reborn standard output buffer
         */
        $this->loader->add_action(
            'template_redirect',
            $this,
            'template_redirect',
            -10
        );

        // add noindex meta
        if (isset($_GET['noabtfr'])) {
            // wordpress header
            $this->loader->add_action('wp_head', $this, 'header', 1);
        }

        /**
         * Setup cron
         */
        $this->loader->add_action('abtfr_cron', $this, 'cron');
        $this->loader->add_action('wp', $this, 'setup_cron');
    }

    /**
     * Check if optimization should be applied to output
     */
    public function is_enabled() {
        /**
         * Disable for Google AMP pages
         */
        if (function_exists('is_amp_endpoint') && is_amp_endpoint()) {
            return false;
        }

        /**
         * Disable for REST API requests
         */
        if (defined('REST_REQUEST') && REST_REQUEST) {
            return false;
        }

        /**
         * Disable ABTF Reborn
         */
        if (defined('DONOTABTFR') && DONOTABTFR) {
            return false;
        }

        /**
         * o10n Critical CSS Editor
         */
        if (
            isset($_GET['o10n-css']) ||
            isset($_GET['o10n-no-css']) ||
            isset($_GET['o10n-full-css'])
        ) {
            return false;
        }

        /**
         * Skip if admin
         */
        if (defined('WP_ADMIN')) {
            return false;
        }

        /**
         * Skip if doing AJAX
         */
        if (defined('DOING_AJAX')) {
            return false;
        }

        /**
         * Skip if doing cron
         */
        if (defined('DOING_CRON')) {
            return false;
        }

        /**
         * Skip if APP request
         */
        if (defined('APP_REQUEST')) {
            return false;
        }

        /**
         * Skip if XMLRPC request
         */
        if (defined('XMLRPC_REQUEST')) {
            return false;
        }

        /**
         * Check for WPMU's and WP's 3.0 short init
         */
        if (defined('SHORTINIT') && SHORTINIT) {
            return false;
        }

        /**
         * Check if we're displaying feed
         */
        if ($this->template_redirect_called && is_feed()) {
            return false;
        }

        /**
         * Register or login page
         */
        if (
            isset($GLOBALS['pagenow']) &&
            in_array($GLOBALS['pagenow'], array(
                'wp-login.php',
                'wp-register.php'
            ))
        ) {
            return false;
        }

        /**
         * Disable plugin with query string ?noabtfr
         */
        if (isset($_GET['noabtfr'])) {
            return false;
        }

        return true;
    }

    /**
     * Template redirect hook (required for is_feed() enabled check)
     */
    public function template_redirect() {
        // detect new optimization plugins
        if (defined('O10N_CORE_VERSION') && class_exists('\O10n\Core')) {
            $modules = O10n\Core::get('modules');
            if (in_array('css', $modules)) {
                define('O10N_CSS_MODULE_LOADED', true);
            }
            if (in_array('fonts', $modules)) {
                define('O10N_FONTS_MODULE_LOADED', true);
            }
            if (in_array('js', $modules)) {
                define('O10N_JS_MODULE_LOADED', true);

                add_action(
                    'o10n_script_text_pre',
                    array($this->optimization, 'ignore_abtfr'),
                    1,
                    2
                );
            }
        }

        // return content security hashes
        if (isset($_GET['abtfr-csp-hash'])) {
            $json = array();

            $algorithms = array('sha256', 'sha384', 'sha512');

            // verify noonce
            /*if (!wp_verify_nonce($_GET['abtfr-csp-hash'], 'csp_hash_json')) {
                foreach ($algorithms as $algorithm) {
                    $json[$algorithm] = array(
                        'public' => 'WORDPRESS_NONCE_AUTH_FAILED',
                        'debug' => 'WORDPRESS_NONCE_AUTH_FAILED'
                    );
                }
            } else {*/
            foreach ($algorithms as $algorithm) {
                try {
                    $json[$algorithm] = array(
                        'public' => $this->optimization->get_client_script_hash(
                            false,
                            $algorithm
                        ),
                        'debug' => $this->optimization->get_client_script_hash(
                            true,
                            $algorithm
                        )
                    );
                } catch (Exception $err) {
                    $json[$algorithm] = array(
                        'public' => 'FAILED',
                        'debug' => 'FAILED'
                    );
                }
            }
            //}

            while (ob_get_level()) {
                ob_end_clean();
            }

            print json_encode($json);
            exit();
        }

        $this->template_redirect_called = true;

        /**
         * Disable plugin
         */
        if (!$this->is_enabled()) {
            $this->disabled = true;
        }
    }

    /**
     * Load the required dependencies
     */
    private function load_dependencies() {
        /**
         * The class responsible for orchestrating the actions and filters of the
         * core plugin
         */
        require_once WPABTFR_PATH . 'includes/loader.class.php';

        /**
         * The class responsible for defining internationalization functionality
         * of the plugin
         */
        require_once WPABTFR_PATH . 'includes/i18n.class.php';

        /**
         * The class responsible for defining all actions related to Google PWA optimization
         */
        require_once WPABTFR_PATH . 'includes/pwa.class.php';

        /**
         * The class responsible for defining all actions related to HTTP2 optimization
         */
        require_once WPABTFR_PATH . 'includes/http2.class.php';

        /**
         * The class responsible for defining all actions related to Web Font optimization
         */
        require_once WPABTFR_PATH . 'includes/webfonts.class.php';

        /**
         * External resource proxy
         */
        require_once WPABTFR_PATH . 'includes/proxy.class.php';

        /**
         * The class responsible for defining all actions that occur in the Dashboard.
         */
        require_once WPABTFR_PATH . 'admin/admin.class.php';

        // do not load the rest of the dependencies for proxy
        if ($this->view === 'abtfr-proxy') {
            return;
        }

        /**
         * The class responsible for defining all actions related to optimization.
         */
        require_once WPABTFR_PATH . 'includes/optimization.class.php';

        /**
         * The class responsible for defining all actions related to critical css optimization.
         */
        require_once WPABTFR_PATH . 'includes/critical-css.class.php';

        /**
         * The class responsible for defining all actions related to lazy script loading.
         */
        require_once WPABTFR_PATH . 'includes/lazyscripts.class.php';

        /**
         * Extract Full CSS view
         */
        if (
            in_array($this->view, array('extract-css', 'abtfr-buildtool-css'))
        ) {
            /**
             * The class responsible for defining all actions related to full css extraction
             */
            require_once WPABTFR_PATH . 'includes/extract-full-css.class.php';
        }

        /**
         * Critical CSS Quality Test view
         */
        if ($this->view === 'critical-css-editor') {
            /**
             * The class responsible for defining all actions related to compare critical CSS
             */
            require_once WPABTFR_PATH .
                'includes/critical-css-editor.class.php';
        }

        /**
         * The class responsible plugin extension modules.
         */
        require_once WPABTFR_PATH . 'includes/plugins.class.php';
        require_once WPABTFR_PATH . 'modules/plugins.class.php';
    }

    /**
     * Return url with view query string
     */
    public function view_url($view, $query = array(), $currenturl = false) {
        if (!$currenturl) {
            if (
                is_admin() ||
                (defined('DOING_AJAX') && DOING_AJAX) ||
                in_array($GLOBALS['pagenow'], array(
                    'wp-login.php',
                    'wp-register.php'
                ))
            ) {
                $currenturl = home_url();
            } else {
                $currenturl =
                    (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']
                        ? 'https'
                        : 'http') .
                    '://' .
                    $_SERVER['HTTP_HOST'] .
                    $_SERVER['REQUEST_URI'];
            }
        }

        /**
         * Return url with view query string
         */

        switch ($view) {
            case 'critical-css-editor':
            case 'critical-css-view':
                $value = 1;
                break;
            default:
                $value = md5(SECURE_AUTH_KEY . AUTH_KEY);
                break;
        }

        return preg_replace('|\#.*$|Ui', '', $currenturl) .
            (strpos($currenturl, '?') !== false ? '&' : '?') .
            $view .
            '=' .
            $value .
            (!empty($query) ? '&' . http_build_query($query) : '');
    }

    /**
     * Define the locale for this plugin for internationalization.
     *
     * Uses the ABTFR_i18n class in order to set the domain and to register the hook
     * with WordPress
     */
    private function set_locale() {
        $plugin_i18n = new ABTFR_i18n();
        $plugin_i18n->set_domain($this->get_plugin_name());

        $this->loader->add_action(
            'plugins_loaded',
            $plugin_i18n,
            'load_plugin_textdomain'
        );
    }

    /**
     * WordPress header
     */
    public function header() {
        print '<meta name="robots" content="noindex, nofollow" />';
    }

    /**
     * Run the loader to execute all of the hooks with WordPress
     */
    public function run() {
        $this->loader->run();

        /**
         * If proxy, start processing request
         */
        if ($this->view === 'abtfr-proxy') {
            $this->proxy->handle_request();
        }
    }

    /**
     * The name of the plugin used to uniquely identify it within the context of
     * WordPress and to define internationalization functionality
     */
    public function get_plugin_name() {
        return $this->plugin_name;
    }

    /**
     * The reference to the class that orchestrates the hooks with the plugin
     */
    public function get_loader() {
        return $this->loader;
    }

    /**
     * Retrieve the version number of the plugin
     */
    public function get_version() {
        return $this->version;
    }

    /**
     * Create directory
     */
    public function mkdir($path, $mask = 0755) {
        if (!is_dir($path)) {
            if (!@mkdir($path, $mask)) {
                wp_die('Failed to write to: ' . $path);
            }
        }
        if (is_dir($path)) {
            chmod($path, $mask);

            return true;
        }

        return false; // error
    }

    /**
     * Remove directory
     */
    public function rmdir($dir) {
        if (!is_dir($dir)) {
            return false;
        }

        // restrict access to plugin directories
        if (
            strpos($dir, '/abtfr/') === false &&
            strpos($dir, '/abtfr/') === false
        ) {
            return false;
        }

        $files = array_diff(scandir($dir), array('.', '..'));
        foreach ($files as $file) {
            is_dir("$dir/$file")
                ? $this->rmdir("$dir/$file")
                : @unlink("$dir/$file");
        }

        return @rmdir($dir);
    }

    /**
     * File put contents
     */
    public function file_put_contents($file, $contents, $mask = 0644) {
        if (file_exists($file)) {
            @unlink($file);
        }
        file_put_contents($file, $contents);

        if (file_exists($file)) {
            chmod($file, $mask);

            return true;
        }

        return false; // error
    }

    /**
     * Cache path
     */
    public function cache_path($type = '', $mask = 0755) {
        $path = ABTFR_CACHE_DIR;
        if (!is_dir($path)) {
            if (!$this->mkdir($path, $mask)) {
                wp_die('Failed to write to ' . $path);
            }
        }

        switch ($type) {
            case 'proxy':
                $path .= 'proxy/';
                break;
            case 'http2_css':
                $path .= 'http2_css/';
                break;
        }
        if (!is_dir($path)) {
            if (!$this->mkdir($path, $mask)) {
                wp_die('Failed to write to ' . $path);
            }
        }

        return apply_filters('abtfr_cache_path', $path);
    }

    /**
     * Cache URL
     */
    public function cache_dir($type = '') {
        $path = ABTFR_CACHE_URL;
        switch ($type) {
            case 'proxy':
                $path .= 'proxy/';
                break;
            case 'http2_css':
                $path .= 'http2_css/';
                break;
        }

        return apply_filters('abtfr_cache_dir', $path);
    }

    /**
     * Theme content path
     */
    public function theme_path($type = false, $mask = 0755) {
        $path = trailingslashit(get_stylesheet_directory()) . 'abtfr/';
        if (!is_dir($path)) {
            if (!$this->mkdir($path, $mask)) {
                wp_die('Failed to write to ' . $path);
            }

            // put readme in /abtfr/ directory
            $this->file_put_contents(
                $path . 'readme.txt',
                file_get_contents(WPABTFR_PATH . 'public/readme.txt')
            );
        }

        if ($type) {
            switch ($type) {
                case 'critical-css':
                    $path .= 'css/';
                    if (!is_dir($path)) {
                        if (!$this->mkdir($path, $mask)) {
                            wp_die('Failed to write to ' . $path);
                        }
                    }
                    break;
            }
        }

        return apply_filters('abtfr_theme_path', $path);
    }

    /**
     * Theme content URL
     */
    public function theme_dir($cdn = '', $type = false) {
        if ($cdn !== '') {
            $path =
                trailingslashit($cdn) .
                trailingslashit(
                    str_replace(
                        trailingslashit(ABSPATH),
                        '',
                        get_stylesheet_directory_uri()
                    )
                ) .
                'abtfr/';
        } else {
            $path = trailingslashit(get_stylesheet_directory_uri()) . 'abtfr/';
        }

        if ($type) {
            switch ($type) {
                case 'critical-css':
                    $path .= 'css/';
                    break;
            }
        }

        return apply_filters('abtfr_theme_dir', $path);
    }

    /**
     * Remote get using wp_remote_get (previously cURL)
     */
    public function remote_get($url, $args = array()) {
        $args = array_merge(
            array(
                'timeout' => 60,
                'redirection' => 5,
                'sslverify' => false,

                // Chrome Generic Win10
                // @link https://techblog.willshouse.com/2012/01/03/most-common-user-agents/
                'user-agent' =>
                    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36'
            ),
            $args
        );

        // Request headers
        if (!isset($args['headers']) || !is_array($args['headers'])) {
            $args['headers'] = array();
        }

        /**
         * Disable keep-alive
         */
        $args['headers'][] = 'Connection: close';

        // Request
        $res = wp_remote_get($url, $args);
        if (is_array($res)) {
            return trim($res['body']);
        }

        return false; // error
    }

    /**
     * Fired during plugin activation.
     */
    public function activate() {
        /**
         * Set default options
         */
        $default_options = array();

        /**
         * Critical CSS
         */
        $default_options['csseditor'] = true;

        /**
         * CSS Delivery Optimization
         */
        $default_options['cssdelivery'] = false;
        $default_options['loadcss_enhanced'] = true;
        $default_options['cssdelivery_position'] = 'header';

        /**
         * Javascript Delivery Optimization
         */
        $default_options['jsdelivery'] = false;
        $default_options['jsdelivery_position'] = 'header';
        $default_options['jsdelivery_jquery'] = true;
        $default_options['jsdelivery_async_all'] = true;

        /**
         * Web Font Optimization
         */
        $default_options['gwfo'] = false;
        $default_options['gwfo_loadmethod'] = 'inline';
        $default_options['gwfo_loadposition'] = 'header';
        $default_options['gwfo_googlefonts_auto'] = true;

        /**
         * Other
         */
        $default_options['debug'] = false;
        $default_options['adminbar'] = true;
        $default_options['clear_pagecache'] = false;

        // Store default options
        $options = get_option('abtfr');
        if (empty($options)) {
            update_option('abtfr', $default_options, true);
        }

        // setup cron
        $this->setup_cron();
    }

    /**
     * Fired during plugin deactivation.
     */
    public function deactivate() {
        // remove cron
        wp_clear_scheduled_hook('abtfr_cron');
    }

    /**
     * Cron method
     */
    public function cron() {
        // proxy cleanup cron
        $this->proxy->cron_prune();

        // HTTP2 critical css cleanup cron
        $this->criticalcss->http2_cache_cron_prune();
    }

    /**
     * Setup cron
     */
    public function setup_cron() {
        if (
            function_exists('wp_next_scheduled') &&
            !wp_next_scheduled('abtfr_cron')
        ) {
            //schedule the event to run twice daily
            wp_schedule_event(
                current_time('timestamp'),
                'twicedaily',
                'abtfr_cron'
            );
        }
    }
}
