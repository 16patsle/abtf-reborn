import React from 'react';
import { Helmet } from 'react-helmet';
import { __ } from '@wordpress/i18n';
import useSWR from 'swr';
import useLinkState from '../utils/useLinkState';
import {
  adminUrl,
  siteTitle,
  abtfrAdminNonce,
  utmString
} from '../utils/globalVars';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import vs from 'react-syntax-highlighter/dist/esm/styles/hljs/vs';
import Info from '../components/Info';
import PageContent from '../components/PageContent';
import SettingCheckbox from '../components/SettingCheckbox';
import SettingSelect from '../components/SettingSelect';
import SettingTextarea from '../components/SettingTextarea';
import SettingRadio from '../components/SettingRadio';
import SubmitButton from '../components/SubmitButton';
import getSettings from '../utils/getSettings';

SyntaxHighlighter.registerLanguage('xml', xml);

const proxyUrl = new URL(adminUrl + 'admin.php');
proxyUrl.searchParams.append('page', 'abtfr-proxy');

const lazyloadExample = `
<div data-lazy-widget>
<!--
    <div id="fblikebutton_1" className="fb-like" data-href="https://github.com/16patsle/" 
    data-layout="standard" data-action="like" data-show-faces="true" data-share="true"></div>
    <script>
    FB.XFBML.parse(document.getElementById('fblikebutton_1').parentNode||null);
    </script>
-->
</div>
    `.trim();

const JavascriptView = () => {
  const [options, setOption, setOptions, linkOptionState] = useLinkState();

  const getOption = option => options[option];

  const { data, error } = useSWR('settings', getSettings);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const loading = <div>Loading...</div>;

  if (!data) {
    return loading;
  }

  if (!options) {
    setOptions(data);
    return loading;
  }

  return (
    <form
      method="post"
      action={adminUrl + 'admin-post.php?action=abtfr_javascript_update'}
      className="clearfix"
    >
      <div dangerouslySetInnerHTML={{ __html: abtfrAdminNonce }}></div>
      <PageContent header={__('Javascript Optimization')}>
        <Helmet>
          <title>Javascript Optimization {siteTitle}</title>
        </Helmet>
        <Info
          color="seagreen"
          style={{ marginBottom: '0px', fontSize: '14px' }}
        >
          <strong>Tip:</strong> More information about javascript optimization
          can be found in{' '}
          <a
            href={'https://www.igvita.com/?' + utmString}
            target="_blank"
            rel="noopener noreferrer"
          >
            this blog
          </a>{' '}
          by Ilya Grigorik, web performance engineer at Google and author of the
          O'Reilly book{' '}
          <a
            href={
              'https://www.amazon.com/High-Performance-Browser-Networking-performance/dp/1449344763/?' +
              utmString
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            High Performance Browser Networking
          </a>{' '}
          (
          <a
            href={'https://hpbn.co/?' + utmString}
            target="_blank"
            rel="noopener noreferrer"
          >
            free online
          </a>
          ).
        </Info>
        <table className="form-table">
          <tbody>
            <SettingCheckbox
              header="Optimize Javascript Loading"
              name="abtfr[jsdelivery]"
              label="Enabled"
              link={linkOptionState('jsdelivery')}
              description={
                <span>
                  When enabled, Javascript files are loaded asynchronously using
                  an enhanced version of{' '}
                  <a
                    href="https://github.com/walmartlabs/little-loader"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    little-loader
                  </a>{' '}
                  from Walmart Labs (
                  <a
                    href={
                      'https://formidable.com/blog/2016/01/07/the-only-correct-script-loader-ever-made/#' +
                      utmString
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    reference
                  </a>
                  ).
                </span>
              }
            ></SettingCheckbox>
            <tr
              valign="top"
              className="jsdeliveryoptions"
              style={!getOption('jsdelivery') ? { display: 'none' } : {}}
            >
              <td colSpan="2" style={{ paddingTop: '0px' }}>
                <div className="abtfr-inner-table">
                  <h3 className="h">
                    <span>Javascript Load Optimization</span>
                  </h3>
                  <div className="inside">
                    <p
                      style={{
                        padding: '5px',
                        borderBottom: 'solid #efefef',
                        margin: '0px'
                      }}
                    >
                      <span style={{ color: 'red', fontWeight: 'bold' }}>
                        Warning:
                      </span>{' '}
                      It may require some tweaking of the settings to prevent
                      javascript problems.
                    </p>
                    <table className="form-table">
                      <tbody>
                        <SettingRadio
                          header="Script Loader"
                          name="abtfr[jsdelivery_scriptloader]"
                          link={linkOptionState('jsdeliveryScriptloader')}
                          radios={[
                            {
                              value: 'little-loader',
                              label: (
                                <span>
                                  <a
                                    href="https://github.com/walmartlabs/little-loader"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    little-loader
                                  </a>{' '}
                                  from Walmart Labs (
                                  <a
                                    href={
                                      'https://formidable.com/blog/2016/01/07/the-only-correct-script-loader-ever-made/#' +
                                      utmString
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    reference
                                  </a>
                                  )
                                </span>
                              ),
                              description: (
                                <span style={{ marginBottom: '5px' }}>
                                  A stable async script loader that works in old
                                  browsers.
                                </span>
                              )
                            },
                            {
                              value: 'html5',
                              label:
                                ' little-loader + HTML5 Web Worker and Fetch API based script loader with localStorage cache',
                              description: (
                                <span>
                                  {!getOption('jsProxy') ? (
                                    <span
                                      className="description"
                                      style={{ color: 'red' }}
                                    >
                                      This script loader requires the{' '}
                                      <a href={proxyUrl}>Javascript proxy</a> to
                                      be enabled to bypass{' '}
                                      <a
                                        href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        CORS
                                      </a>
                                      .
                                    </span>
                                  ) : null}
                                  <span className="description">
                                    A state of the art script loader for optimal
                                    mobile speed, inspired by{' '}
                                    <a
                                      href={
                                        'https://addyosmani.com/basket.js/#' +
                                        utmString
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      basket.js
                                    </a>{' '}
                                    (by a Google engineer), a script loading
                                    concept in use by Google. With fallback to
                                    little-loader for old browsers.
                                  </span>
                                </span>
                              )
                            }
                          ]}
                        >
                          <div className="info_yellow">
                            <p
                              className="description"
                              style={{ marginTop: '0px' }}
                            >
                              <strong>
                                Advantages of the HTML5 script loader
                              </strong>
                            </p>
                            <span
                              className="description"
                              style={{ marginBottom: '0px' }}
                            >
                              <ul style={{ margin: '0px', padding: '0px' }}>
                                <li style={{ margin: '0px', padding: '0px' }}>
                                  &nbsp;
                                  <span style={{ color: '#666' }}>➤</span> 0
                                  javascript file download during navigation
                                </li>
                                <li style={{ margin: '0px', padding: '0px' }}>
                                  &nbsp;
                                  <span style={{ color: '#666' }}>➤</span> 0
                                  javascript file download for returning
                                  visitors
                                </li>
                                <li style={{ margin: '0px', padding: '0px' }}>
                                  &nbsp;
                                  <span style={{ color: '#666' }}>➤</span> abide
                                  WordPress dependencies
                                </li>
                                <li style={{ margin: '0px', padding: '0px' }}>
                                  &nbsp;
                                  <span style={{ color: '#666' }}>➤</span>{' '}
                                  faster script loading than browser cache,
                                  especially on mobile
                                </li>
                              </ul>
                            </span>
                          </div>
                        </SettingRadio>
                        <SettingSelect
                          header="Position"
                          name="abtfr[jsdelivery_position]"
                          link={linkOptionState('jsdeliveryPosition')}
                          options={[
                            {
                              value: 'header',
                              name: 'Header'
                            },
                            {
                              value: 'footer',
                              name: 'Footer'
                            }
                          ]}
                          description="Select the position where the async loading of Javascript will start."
                        ></SettingSelect>
                        <SettingTextarea
                          header="Ignore List"
                          style={{
                            width: '100%',
                            height: '50px',
                            fontSize: '11px'
                          }}
                          name="abtfr[jsdelivery_ignore]"
                          link={linkOptionState('jsdeliveryIgnore')}
                          description="Scripts to ignore in Javascript delivery optimization. One script per line. The files will be left untouched in the HTML."
                        ></SettingTextarea>
                        <SettingTextarea
                          header="Remove List"
                          style={{
                            width: '100%',
                            height: '50px',
                            fontSize: '11px'
                          }}
                          name="abtfr[jsdelivery_remove]"
                          link={linkOptionState('jsdeliveryRemove')}
                          description="Scripts to remove from HTML. One script per line. This feature enables to include small plugin related scripts inline."
                        ></SettingTextarea>
                        <SettingCheckbox
                          header="Force Async"
                          name="abtfr[jsdelivery_async_all]"
                          label="Enabled"
                          link={linkOptionState('jsdeliveryAsyncAll')}
                          description="When enabled, all scripts are loaded asynchronously."
                        ></SettingCheckbox>
                        {!getOption('jsdeliveryAsyncAll') ? (
                          <SettingTextarea
                            header="Async Force List"
                            style={{
                              width: '100%',
                              height: '50px',
                              fontSize: '11px'
                            }}
                            name="abtfr[jsdelivery_async]"
                            link={linkOptionState('jsdeliveryAsync')}
                            description="Enter (parts of) scripts to force to load async. All other scripts are loaded in sequential blocking order if not specifically configured as async in HTML."
                          >
                            <span className="description">
                              Example:
                              <ol
                                style={{
                                  margin: '0px',
                                  padding: '0px',
                                  paddingLeft: '2em',
                                  marginTop: '10px'
                                }}
                              >
                                <li>Script1: non-async [wait...]</li>
                                <li>
                                  Script 2,3,4: async, Script 5: non-async
                                  [wait...]
                                </li>
                                <li>Script 6</li>
                              </ol>
                            </span>
                          </SettingTextarea>
                        ) : null}
                        <SettingTextarea
                          header="Async Disabled List"
                          style={{
                            width: '100%',
                            height: '50px',
                            fontSize: '11px'
                          }}
                          name="abtfr[jsdelivery_async_disabled]"
                          link={linkOptionState('jsdeliveryAsyncDisabled')}
                          description="Enter (parts of) scripts to force to load blocking (non-async)."
                        ></SettingTextarea>
                        <SettingTextarea
                          header="requestIdleCallback"
                          style={{
                            width: '100%',
                            height: '50px',
                            fontSize: '11px'
                          }}
                          name="abtfr[jsdelivery_idle]"
                          disabled={
                            !getOption('jsProxy') &&
                            getOption('jsdeliveryScriptloader') !== 'html5'
                          }
                          link={linkOptionState('jsdeliveryIdle')}
                          description={
                            <span>
                              Enter a list with{' '}
                              <code>script_string[:timeout_ms]</code> entries
                              (one per line) to execute scripts in CPU idle time
                              within an optional timeout in milliseconds. This
                              feature enables to prioritize script execution. (
                              <a
                                href="https://developers.google.com/web/updates/2015/08/using-requestidlecallback"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                more information
                              </a>
                              )
                            </span>
                          }
                        >
                          {!getOption('jsProxy') &&
                          getOption('jsdeliveryScriptloader') !== 'html5' ? (
                            <p
                              style={{
                                paddingBottom: '5px',
                                color: 'maroon'
                              }}
                            >
                              This feature requires the HTML5 script loader.
                            </p>
                          ) : (
                            <p style={{ paddingBottom: '5px' }}>
                              This feature only applies to localStorage cached
                              scripts.
                              {/* Our new plugin will enable this option for all scripts.*/}
                            </p>
                          )}
                          <Info color="yellow" style={{ marginTop: '7px' }}>
                            Example: <code>script.js:2000</code> (script.js
                            should execute when CPU is available or within 2
                            seconds). Timeout is optional.
                          </Info>
                        </SettingTextarea>
                        <SettingCheckbox
                          header="Abide Dependencies"
                          name="abtfr[jsdelivery_deps]"
                          label="Enabled"
                          link={linkOptionState('jsdeliveryDeps')}
                          description={
                            <span>
                              When enabled, scripts will be loaded in sequential
                              order abiding the WordPress dependency
                              configuration from{' '}
                              <a
                                href="https://developer.wordpress.org/reference/functions/wp_enqueue_script/"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                wp_enqueue_script()
                              </a>
                              .
                            </span>
                          }
                        ></SettingCheckbox>
                        <SettingCheckbox
                          header="jQuery Stub"
                          name="abtfr[jsdelivery_jquery]"
                          label="Enabled"
                          link={linkOptionState('jsdeliveryJquery')}
                          description={
                            <span>
                              When enabled, a queue captures basic jQuery
                              functionality such as{' '}
                              <code>jQuery(function($){' ... '});</code> and{' '}
                              <code>$(document).bind('ready')</code> in inline
                              scripts. This feature enables to load jQuery
                              async.
                            </span>
                          }
                        ></SettingCheckbox>
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
            <SettingCheckbox
              header="Lazy Load Scripts"
              name="abtfr[lazyscripts_enabled]"
              label="Enabled"
              link={linkOptionState('lazyscriptsEnabled')}
              description={
                <span>
                  When enabled, the widget module from{' '}
                  <a
                    href="https://github.com/ressio/lazy-load-xt#widgets"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    jQuery Lazy Load XT
                  </a>{' '}
                  is loaded to enable lazy loading of inline scripts such as
                  Facebook like and Twitter follow buttons.
                </span>
              }
            >
              {getOption('lazyscriptsEnabled') ? (
                <span>
                  <p className="description lazyscriptsoptions">
                    This option is compatible with{' '}
                    <a
                      href={
                        adminUrl +
                        'plugin-install.php?s=Lazy+Load+XT&tab=search&type=term'
                      }
                    >
                      WordPress lazy load plugins
                    </a>{' '}
                    that use Lazy Load XT. Those plugins are <u>not required</u>{' '}
                    for this feature.
                  </p>
                  <div
                    style={{ float: 'left', width: '100%', overflow: 'auto' }}
                  >
                    <SyntaxHighlighter
                      className="example-code lazyscriptsoptions"
                      language="xml"
                      style={vs}
                    >
                      {lazyloadExample}
                    </SyntaxHighlighter>
                  </div>
                </span>
              ) : null}
            </SettingCheckbox>
          </tbody>
        </table>
        <hr />
        <SubmitButton type={['primary', 'large']} name="is_submit">
          {__('Save')}
        </SubmitButton>
      </PageContent>
    </form>
  );
};

export default JavascriptView;
