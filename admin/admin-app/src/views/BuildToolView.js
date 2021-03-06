import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { __, sprintf } from '@wordpress/i18n';
import { ExternalLink } from '@wordpress/components';
import { useJSON } from '../utils/useSettings';
import {
  homeUrl,
  adminUrl,
  siteTitle,
  abtfrAdminNonce,
  lgCode,
  buildToolPrefillValues,
  buildToolInstalled
} from '../utils/globalVars';
import { getJSON } from '../utils/getSettings';
import newlineArrayString from '../utils/newLineArrayString';
import LoadingWrapper from '../components/LoadingWrapper';
import Info from '../components/Info';
import PageContent from '../components/PageContent';
import SettingInnerTable from '../components/SettingInnerTable';
import SettingTextInput from '../components/SettingTextInput';
import SettingTextarea from '../components/SettingTextarea';
import SettingSelect from '../components/SettingSelect';
import SettingCheckbox from '../components/SettingCheckbox';
import SubmitButton from '../components/SubmitButton';
import PageSelect from '../components/PageSelect';
import './BuildToolView.css';
import scrollToElement from '../utils/scrollToElement';
import SubNav from '../components/SubNav';

const BuildToolView = () => {
  const { options: conditionalValues, shouldRender, error } = useJSON(
    'conditionalcss',
    query => {
      return getJSON(query);
    },
    'conditionalValues'
  );

  const [taskName, setTaskName] = useState(buildToolPrefillValues.taskname);
  const [page, setPage] = useState();
  const [dimensions, setDimensions] = useState(
    newlineArrayString(buildToolPrefillValues.dimensions)
  );
  const [extra, setExtra] = useState(buildToolPrefillValues.extra);
  const [update, setUpdate] = useState(
    buildToolPrefillValues.update.replace(/^global$/, 'global.css')
  );

  const showConditionalOptions =
    conditionalValues && Object.entries(conditionalValues).length > 0;

  const options = [
    {
      label: __('Do not update (store result in /package/output/)', 'abtfr'),
      value: ''
    },
    {
      label: __('Overwrite global Critical CSS', 'abtfr'),
      value: 'global.css'
    },
    {
      label: showConditionalOptions
        ? __('Conditional Critical CSS', 'abtfr')
        : '',
      value: '-',
      disabled: true
    },
    ...(showConditionalOptions
      ? Object.entries(conditionalValues).map(([file, data]) => ({
          label: sprintf(
            __('Overwrite %s', 'abtfr'),
            file + ' – ' + data.config.name
          ),
          value: file
        }))
      : [])
  ];

  return (
    <LoadingWrapper shouldRender={shouldRender} error={error}>
      <SubNav isBuildTool />
      <form
        method="post"
        action={
          adminUrl + 'admin-post.php?action=abtfr_create_critical_package'
        }
        className="clearfix abtfr-bt-builder"
      >
        <div dangerouslySetInnerHTML={{ __html: abtfrAdminNonce }}></div>
        <PageContent header={__('Critical Path CSS Creator', 'abtfr')}>
          <Helmet>
            <title>
              {__('Critical Path CSS Creator', 'abtfr')} {siteTitle}
            </title>
          </Helmet>
          <p>
            Most advanced optimization software such as critical path CSS
            creation are easiest to use using a build tool such as{' '}
            <ExternalLink href="http://gruntjs.com/">Grunt.js</ExternalLink> and{' '}
            <ExternalLink href="http://gulpjs.com/">Gulp.js</ExternalLink>.
            While those build tools make it easy to use professional software
            for experienced developers, most average WordPress users will not be
            able to use them and thus have no access to professional
            optimization software.
          </p>
          <p>
            This WordPress based <em>build tool builder</em> enables
            professional critical path CSS creation via{' '}
            <ExternalLink href="https://github.com/addyosmani/critical">
              critical
            </ExternalLink>{' '}
            (by a Google engineer) using the build tool{' '}
            <ExternalLink href="http://gulpjs.com/">Gulp.js</ExternalLink>.
          </p>
          <table className="form-table">
            <tbody>
              <SettingInnerTable
                header={__(
                  'Create a Gulp.js Critical CSS Task Package',
                  'abtfr'
                )}
              >
                <SettingTextInput
                  header={__('Task Name', 'abtfr')}
                  name="taskname"
                  link={{ value: taskName, set: setTaskName }}
                  size="50"
                  pattern="^[a-z\d-]*$"
                  placeholder={__(
                    'Enter a Gulp.js task name (no spaces).',
                    'abtfr'
                  )}
                  description={
                    <>
                      The task name is used as task command and as subdirectory
                      (/theme/abtfr/<strong>task-name</strong>/).
                    </>
                  }
                />
                <PageSelect
                  header={__('Page', 'abtfr')}
                  name="url"
                  link={{ value: page, set: setPage }}
                  description={__(
                    'Select a page for which to create critical path CSS.',
                    'abtfr'
                  )}
                  defaultOptions={[
                    { label: __('Home Page (index)', 'abtfr'), value: homeUrl }
                  ]}
                />
                <SettingTextarea
                  header={__('Repsonsive Dimensions', 'abtfr')}
                  name="dimensions"
                  style={{ width: '100%', height: '50px', fontSize: '11px' }}
                  link={{ value: dimensions, set: setDimensions }}
                  placeholder={__(
                    'Leave blank for the default dimension...',
                    'abtfr'
                  )}
                  description={
                    <>
                      Enter one or more responsive dimensions for which to
                      generate critical path CSS. Format: <code>800x600</code>.
                      One dimension per line. The result is combined and
                      compressed. (
                      <ExternalLink href="https://github.com/addyosmani/critical#generate-critical-path-css-with-multiple-resolutions">
                        more info
                      </ExternalLink>
                      ).
                    </>
                  }
                />
                <SettingCheckbox
                  name="extra"
                  header={__('Append extra.css', 'abtfr')}
                  link={{ value: extra, set: setExtra }}
                  description={
                    <>
                      Add a file <code>extra.css</code> to the package to be
                      appended to the critical path CSS. The combined result is
                      minified to prevent overlapping CSS.
                    </>
                  }
                />
                <SettingSelect
                  name="update"
                  header={__('Update Critical CSS', 'abtfr')}
                  link={{ value: update, set: setUpdate }}
                  options={options}
                  description={__(
                    'Use this option to automatically update WordPress Critical CSS.',
                    'abtfr'
                  )}
                />
              </SettingInnerTable>
            </tbody>
          </table>
          <Info color="red">
            <span style={{ color: 'red', fontWeight: 'bold' }}>Warning:</span>{' '}
            No build tool support is provided via the WordPress support forum!
            Bugs, software or build tool conflicts occur often and may be OS,
            Node-software or dependency (version) related. It often is complex,
            even for the most experienced developer. Please seek help via the
            (Github) support forums of relevant software. This build tool
            builder simply relies on 'the latest version' and does not consider
            bugs or conflicts in the latest software.
          </Info>
          <p className="submit-buttons">
            <SubmitButton name="create">
              {__('Install package', 'abtfr')}
            </SubmitButton>
            <SubmitButton name="download">
              {__('Download package (zip)', 'abtfr')}
            </SubmitButton>
          </p>
          <h2 id="howtouse" style={{ marginTop: '1rem' }}>
            {__('How to use', 'abtfr')}
          </h2>
          <p>
            This WordPress tool creates{' '}
            <em>Gulp.js Critical Path CSS Cenerator Task Packages</em> that make
            it easy to create professional quality critical path CSS for
            individual pages.
          </p>
          <strong>Getting started</strong>
          <p>
            <strong>Step 1:</strong> Follow the{' '}
            <a href="#installation" onClick={scrollToElement}>
              installation instructions
            </a>{' '}
          </p>
          <p>
            <strong>Step 2:</strong> create a Critical CSS Task Package
          </p>
          <p>
            <strong>Step 3:</strong> start a command line prompt or SSH shell,
            navigate to <code>/wp-content/themes/THEME_NAME/abtfr/</code> and
            run the task, e.g.{' '}
            <code>
              gulp <strong className="gulp-task-name">task-name</strong>
            </code>
            .
          </p>
          <p>
            Test the quality of the created critical path CSS using the{' '}
            <a href={adminUrl + 'admin.php?page=abtfr-criticalcss-test'}>
              Critical CSS Quality Test
            </a>{' '}
            and optionally use the file <code>extra.css</code> to fix problems
            in the generated Critical Path CSS.
          </p>
          <h2 id="installation">{__('Installation', 'abtfr')}</h2>
          <h4
            style={{ marginBottom: '5px', marginTop: '0px' }}
            id="requirements"
          >
            Requirements:
          </h4>
          <ul>
            <li>A regular PC (Windows, Mac or Linux) with command line.</li>
            <li>
              The installation of{' '}
              <ExternalLink href="https://nodejs.org/">Node.js</ExternalLink> (
              <ExternalLink
                href={`https://encrypted.google.com/search?q=how+to+install+node.js&hl=${lgCode}`}
              >
                click here
              </ExternalLink>{' '}
              for a how-to).
            </li>
            <li>
              The installation of{' '}
              <ExternalLink href="https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md">
                Gulp.js
              </ExternalLink>{' '}
              (<code>npm install --global gulp-cli</code>).
            </li>
          </ul>
          <p>
            The installation of the{' '}
            <em>WordPress Gulp.js Critical Path CSS Generator</em> is required
            just once for your theme. NPM (Node.js Package Manager) will read
            the dependencies from package.json and will install them in the
            /abtfr/ directory.
          </p>
          <p>
            <strong>Step 1:</strong> download <strong>package.json</strong> and{' '}
            <strong>gulpfile.js</strong> and upload the files to{' '}
            <code>
              /wp-content/themes/THEME_NAME/<strong>abtfr</strong>/
            </code>
            . Alternatively click "<em>Auto install</em>" (this will copy the
            files to your theme directory).
          </p>
          <p className="submit-buttons">
            <SubmitButton isSmall name="install_package">
              {buildToolInstalled
                ? '✓ ' + __('Installed', 'abtfr')
                : __('Auto install', 'abtfr')}
            </SubmitButton>
            <SubmitButton isSecondary isSmall name="download_package">
              {__('Download package.json & gulpfile.js', 'abtfr')}
            </SubmitButton>
          </p>
          <p>
            <strong>Step 2:</strong> start a command line prompt or SSH shell
            and navigate to <code>/wp-content/themes/THEME_NAME/abtfr/</code>.
          </p>
          <p>
            <strong>Step 3:</strong> run the command{' '}
            <code>
              <strong>npm install</strong>
            </code>
            .
          </p>
          <p>
            <strong>
              If there are errors during installation you will not be able to
              get support via the WordPress support forums.
            </strong>
            <br />
            Please seek help in platform or software related support forums, for
            example Github.
          </p>
          <h1 style={{ paddingBottom: '0px' }}>More Optimizations</h1>
          <p>
            There are many other WordPress optimizations that can be performed
            via Grunt.js or Gulp.js, for example{' '}
            <ExternalLink
              href={`https://developers.google.com/speed/webp/?hl=${lgCode}`}
            >
              Google WebP
            </ExternalLink>{' '}
            image optimization, uncss (unused CSS stripping), CSS data-uri (CSS
            images) and more.{' '}
            <ExternalLink
              href={`https://encrypted.google.com/search?q=grunt+or+gulp+wordpress+optimization&hl=${lgCode}`}
            >
              Search Google
            </ExternalLink>{' '}
            for more information.
          </p>
          <Info>
            <p style={{ margin: '0px' }}>
              <strong>Tip:</strong> optimize images of your /themes/ and
              /uploads/ directory using Gulp.js or Grunt.js{' '}
              <ExternalLink href="https://github.com/imagemin/imagemin">
                imagemin
              </ExternalLink>{' '}
              using professional image compression software, including Google
              WebP, and instead of overwriting the original images like many
              other solutions, place the images in a subdirectory
              /wp-content/optimized/ and have Nginx serve the optimized image
              only when the optimized version is newer. It will result in the
              best performance, with the best image optimization and instant
              refresh of images when updated in WordPress. And when you want to
              apply a new image optimization technique, you will have the
              original files available. A server cron makes it possible to
              optimize updated images daily.
            </p>
          </Info>
        </PageContent>
      </form>
    </LoadingWrapper>
  );
};

export default BuildToolView;
