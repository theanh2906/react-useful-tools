import { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "enter-your-client-id-here",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "common"}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",

  },
  system: {
    allowPlatformBroker: false // Disables WAM for simpler browser flow
  }
};

export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "User.ReadBasic.All"]
};
