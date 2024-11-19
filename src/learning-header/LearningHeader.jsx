import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import AnonymousUserMenu from './AnonymousUserMenu';
import AuthenticatedUserDropdown from './AuthenticatedUserDropdown';
import ThemeToggleButton from '../ThemeToggleButton';
import messages from './messages';

const LinkedLogo = ({
  href,
  src,
  alt,
  ...attributes
}) => (
  <a href={href} {...attributes}>
    <img className="d-block" src={src} alt={alt} />
  </a>
);

LinkedLogo.propTypes = {
  href: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

let cachedMFEConfig = null;
let cachedCSSUrl = null;

const getMfeConfig = () => {
  if (cachedMFEConfig !== null) {
    return cachedMFEConfig;
  }

  const url = getConfig().MFE_CONFIG_API_URL;
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false); // false makes the request synchronous
    xhr.send(null);

    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      cachedMFEConfig = data;
    } else {
      console.error('Error fetching the URL:', xhr.statusText);
      cachedMFEConfig = null;
    }
  } catch (error) {
    console.error('Error fetching the URL:', error);
    cachedMFEConfig = null;
  }

  console.log('caching MFE_CONFIG:', cachedMFEConfig);
  return cachedMFEConfig;
};


const stepwisemath_pwrcss_url = () => {
  // mcdaniel: add the custom css file to the head
  // note that INDIGO_STEPWISEMATH_PWRCSS_URL is set in https://github.com/StepwiseMath/tutor-indigo-stepwisemath/blob/open-release/redwood.master/tutorindigo/plugin.py#L110
  // and is implemented as a key in MFE_CONFIG.
  //
  // example return value: https://swm-openedx-us-prod-storage.s3.us-east-2.amazonaws.com/static/css/swpwrxblock.css
  if (cachedCSSUrl !== null) {
    return cachedCSSUrl;
  }
  const mfe_config = getMfeConfig();
  if (!mfe_config || !mfe_config.INDIGO_STEPWISEMATH_PWRCSS_URL) {
    console.warn('frontend-component-header WARNING: fetched MFE_CONFIG value for `INDIGO_STEPWISEMATH_PWRCSS_URL` is undefined.');
  };

  cachedCSSUrl = mfe_config.INDIGO_STEPWISEMATH_PWRCSS_URL;
  const validEnvironments = ['prod', 'staging', 'dev'];
  if (!cachedMFEConfig.includes(cachedCSSUrl)) {
    console.warn('frontend-component-header WARNING: fetched MFE_CONFIG value for `INDIGO_STEPWISEMATH_PWRCSS_URL` value of "', cachedCSSUrl, '" is invalid. Valid values are: ', validEnvironments, '.');
  }

  console.log('caching Stepwise Pwr css url:', cachedCSSUrl);
  return cachedCSSUrl;
};


const LearningHeader = ({
  courseOrg, courseNumber, courseTitle, intl, showUserDropdown,
}) => {
  const { authenticatedUser } = useContext(AppContext);

  const css_url = stepwisemath_pwrcss_url();
  useEffect(() => {
    // mount
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = css_url;
    document.head.appendChild(link);
    console.info('frontend-component-header: added link to head:', link);

    // unmount
    return () => {
      document.head.removeChild(link);
    };
  }, []);


  const headerLogo = (
    <LinkedLogo
      className="logo"
      href={`${getConfig().LMS_BASE_URL}/dashboard`}
      src={getConfig().LOGO_URL}
      alt={getConfig().SITE_NAME}
    />
  );

  return (
    <header className="learning-header customise indigo-header-version">
      <a className="sr-only sr-only-focusable" href="#main-content">{intl.formatMessage(messages.skipNavLink)}</a>
      <div className="container-xl py-2 d-flex align-items-center">
        {headerLogo}
        <div className="flex-grow-1 course-title-lockup" style={{ lineHeight: 1 }}>
          <div className="course-info-header">
            <span className="d-block title">{courseTitle}</span>
            <span className="d-block org">{courseOrg} {courseNumber}</span>
          </div>
          <div className="nav-course">
            <a href={`${getConfig().LMS_BASE_URL}/dashboard`}>
              My Courses
            </a>
          </div>
          <div className="nav-course">
            <a href={`${getConfig().LMS_BASE_URL}/courses`}>
              Discover
            </a>
          </div>
        </div>
        <ThemeToggleButton />
        {showUserDropdown && authenticatedUser && (
        <AuthenticatedUserDropdown
          username={authenticatedUser.username}
        />
        )}
        {showUserDropdown && !authenticatedUser && (
        <AnonymousUserMenu />
        )}
      </div>
    </header>
  );
};

LearningHeader.propTypes = {
  courseOrg: PropTypes.string,
  courseNumber: PropTypes.string,
  courseTitle: PropTypes.string,
  intl: intlShape.isRequired,
  showUserDropdown: PropTypes.bool,
};

LearningHeader.defaultProps = {
  courseOrg: null,
  courseNumber: null,
  courseTitle: null,
  showUserDropdown: true,
};

export default injectIntl(LearningHeader);
