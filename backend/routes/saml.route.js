const express = require("express");
const passport = require("passport");
const { Strategy: SamlStrategy } = require("passport-saml");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const FRONTEND_URL = "https://apsmartattendance.onrender.com";
const BACKEND_URL = "https://smart-attendance-backend-m80c.onrender.com";

if (IS_PRODUCTION) {
  const cert = `-----BEGIN CERTIFICATE-----
MIID6DCCAtCgAwIBAgIUdW0To371a+cPZL73Ftg84uYR7BswDQYJKoZIhvcNAQEF
BQAwSTEUMBIGA1UECgwLdm5ydmppZXQuaW4xFTATBgNVBAsMDE9uZUxvZ2luIElk
UDEaMBgGA1UEAwwRT25lTG9naW4gQWNjb3VudCAwHhcNMjUwNTE1MDM0NzE1WhcN
MzAwNTE1MDM0NzE1WjBJMRQwEgYDVQQKDAt2bnJ2amlldC5pbjEVMBMGA1UECwwM
T25lTG9naW4gSWRQMRowGAYDVQQDDBFPbmVMb2dpbiBBY2NvdW50IDCCASIwDQYJ
KoZIhvcNAQEBBQADggEPADCCAQoCggEBALAvSFdnmmFQVOrz5OfUdmXojsgp/+sq
ym7R3jgb5Wicr7Q82ql+WN5qBDi4oTFb11Va3oozTP3YoCEJgbYfeIRibYJuwlwt
4MbrQr1uHxUv5a09wBkAUYS2LJmVRIaMgr7V8iJQq76V6tVGDn5QRmUesvblSIMe
SaYOZnF3UbC/oU+Q52a4F/vq9KBFbinQRw0mTSYlUYGtvDInhRbQSnG+T0UmFieU
K1ThG5TDqexTgsJ6mH3vakfNpaP4rE4h9RnxM3mAx6zfPbJeNLb6+dnRVgPb7SAl
fjLXyi78wUQt50rxzFEIP5IH69a5L1pxiXYmeaIL25F+QN9ehS2awUkCAwEAAaOB
xzCBxDAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBQUi3fjXDDoQXvDYsd2cGq5OAsV
5zCBhAYDVR0jBH0we4AUFIt341ww6EF7w2LHdnBquTgLFeehTaRLMEkxFDASBgNV
BAoMC3ZucnZqaWV0LmluMRUwEwYDVQQLDAxPbmVMb2dpbiBJZFAxGjAYBgNVBAMM
EU9uZUxvZ2luIEFjY291bnQgghR1bROjfvVr5w9kvvcW2Dzi5hHsGzAOBgNVHQ8B
Af8EBAMCB4AwDQYJKoZIhvcNAQEFBQADggEBAD32F6RagHlFUdt1svUoRCsZURHD
mOmqIsIV7QsGZ5klvm6j9jK6UD4JP9869rIn7ZTN/M58JvxauCcBuGdV85Xax7zy
BDNJ
AODocrqjJm/AuvgQ/8PeGzonPlGy5VKbfB5YCAGk7EAdV2KJ1CUNd9IcJc8R
WWasxIyZH86eKLQ6c0yhVVVxGJ2R6KPN6AMay76gU202U/VEa7qceagF0i715c77
wd4zznRTPojp5ce4tgl+6xzrODTDALqxgvnBRDrf1B7rSz1L6DT8MzsG+u5adGjU
UTPcsvdDeJr6BK3cHG4CnpSqZD6vblaSbE3Bu1zYQQyF71q1LLOPsA5J3ng=
-----END CERTIFICATE-----`;

  const samlOptions = {
    callbackUrl: `${BACKEND_URL}/api/auth/saml/callback`,
    entryPoint:
      "https://andhrapradhesh.onelogin.com/trust/saml2/http-post/sso/92f052f1-5620-4df7-95af-41110e6a0203",
    issuer:
      "https://app.onelogin.com/saml/metadata/92f052f1-5620-4df7-95af-41110e6a0203",
    cert: cert,
    identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
    validateInResponseTo: false,
    disableRequestedAuthnContext: true,
    acceptedClockSkewMs: 5000,
    forceAuthn: false,
    passive: false,
  };

  const samlStrategy = new SamlStrategy(samlOptions, (profile, done) => {
    return done(null, {
      username: profile.nameID || profile.email || "samluser",
      email: profile.email,
      id: profile.nameID,
      samlUser: true,
    });
  });

  passport.use(samlStrategy);

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // SAML Routes
  router.get("/api/auth/saml", passport.authenticate("saml"));

router.post(
  "/api/auth/saml/callback",
  passport.authenticate("saml", { failureRedirect: "/admin-login?error=saml" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${FRONTEND_URL}/admin-login?error=saml`);
    }

    const token = jwt.sign(
      {
        username: req.user.username,
        isAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: "10h" }
    );

    // Redirect to frontend with token
    res.redirect(
      `${FRONTEND_URL}/admin-login?token=${encodeURIComponent(token)}`
    );
  }
);

  router.get("/api/auth/saml/metadata", (req, res) => {
    res.type("application/xml");
    res.send(samlStrategy.generateServiceProviderMetadata());
  });

  router.get("/api/auth/saml/logout", (req, res) => {
    res.redirect(
      "https://andhrapradhesh.onelogin.com/trust/saml2/http-redirect/slo/3917218"
    );
  });
} else {
  router.get("/api/auth/saml", (req, res) => {
    res.json({ message: "SAML auth is disabled in development mode" });
  });
}

module.exports = router;
