import { User as FirebaseUser } from "firebase/auth";

export const requiresEmailVerification = (user: FirebaseUser) => !user.emailVerified;

export const requiresPhoneVerification = (_user: FirebaseUser) => false;

export const getNextVerifiedRoute = (user: FirebaseUser) => {
  if (requiresEmailVerification(user)) return "/verify-email";
  if (requiresPhoneVerification(user)) return "/verify-phone";
  return "/dashboard";
};
