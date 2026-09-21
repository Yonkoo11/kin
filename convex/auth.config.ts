// Convex Auth issues its own tokens, so the deployment is its own issuer.
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
