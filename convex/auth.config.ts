// Convex trusts session tokens from the Clerk instance.
// Set CLERK_FRONTEND_API_URL in the Convex dashboard (dev and prod separately),
// e.g. https://verb-noun-00.clerk.accounts.dev or https://clerk.<your-domain>.
export default {
  providers: [
    {
      domain: process.env.CLERK_FRONTEND_API_URL!,
      applicationID: "convex",
    },
  ],
};
