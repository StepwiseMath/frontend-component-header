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

const LearningHeader = ({
  courseOrg, courseNumber, courseTitle, intl, showUserDropdown,
}) => {
  const { authenticatedUser } = useContext(AppContext);

  // mcdaniel: add the custom css file to the head
  useEffect(() => {
    // mount
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://swm-openedx-us-dev-storage.s3.us-east-2.amazonaws.com/static/css/swpwrxblock.css';
    document.head.appendChild(link);

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
