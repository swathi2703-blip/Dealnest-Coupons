export type AccountMode = "buyer" | "seller";

const ACCOUNT_MODE_KEY = "dealnest_account_mode";
const BUYER_THEME_CLASS = "mode-buyer";
const SELLER_THEME_CLASS = "mode-seller";

export const applyAccountModeTheme = (mode: AccountMode) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.remove(BUYER_THEME_CLASS, SELLER_THEME_CLASS);
  root.classList.add(mode === "seller" ? SELLER_THEME_CLASS : BUYER_THEME_CLASS);
};

export const getAccountMode = (): AccountMode => {
  const storedMode = localStorage.getItem(ACCOUNT_MODE_KEY);
  return storedMode === "seller" ? "seller" : "buyer";
};

export const setAccountMode = (mode: AccountMode) => {
  localStorage.setItem(ACCOUNT_MODE_KEY, mode);
  applyAccountModeTheme(mode);
};
