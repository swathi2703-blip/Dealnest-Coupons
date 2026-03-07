export const ALLOWED_EMAIL_DOMAIN = "@klh.edu.in";

export const isAllowedKlhEmail = (email: string) =>
  email.trim().toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN);
