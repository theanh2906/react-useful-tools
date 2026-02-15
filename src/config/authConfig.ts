/**
 * @module config/authConfig
 * @description Microsoft Azure AD (MSAL) authentication configuration.
 * Provides settings for OAuth 2.0 popup-based login with Azure Active Directory.
 */

import { Configuration, PopupRequest } from '@azure/msal-browser';

/**
 * MSAL (Microsoft Authentication Library) configuration.
 *
 * Configures the Azure AD client for popup-based authentication.
 * Uses session storage for token caching and disables WAM (Web Account Manager)
 * for simpler browser-only authentication flow.
 *
 * @see {@link https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications}
 */
export const msalConfig: Configuration = {
  auth: {
    clientId:
      import.meta.env.VITE_AZURE_CLIENT_ID || 'enter-your-client-id-here',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
  system: {
    allowPlatformBroker: false, // Disables WAM for simpler browser flow
  },
};

/**
 * Default scopes requested during Azure AD login.
 *
 * - `User.Read` — Read the signed-in user's profile.
 * - `User.ReadBasic.All` — Read basic profiles of all users in the organization.
 */
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'User.ReadBasic.All'],
};
