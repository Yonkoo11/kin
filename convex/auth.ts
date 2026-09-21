import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

// Password rather than an OAuth provider, on purpose.
//
// The people who need this are settling an estate, often on a borrowed laptop, often
// not the person whose Google account the deceased's mail sits in. Requiring a
// third-party login is a wall at the worst possible moment. An email and a password
// works everywhere, including for someone who has never signed into anything but
// their own bank.
//
// Convex Auth v2 is labelled "super alpha" by the organisers of this hackathon, so
// this uses the stable @convex-dev/auth instead.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
