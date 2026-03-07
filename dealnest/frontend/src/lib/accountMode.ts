export type AccountMode = "buyer" | "seller";

const ACCOUNT_MODE_KEY = "dealnest_account_mode";

export const getAccountMode = (): AccountMode => {
  const storedMode = localStorage.getItem(ACCOUNT_MODE_KEY);
  return storedMode === "seller" ? "seller" : "buyer";
};

export const setAccountMode = (mode: AccountMode) => {
  localStorage.setItem(ACCOUNT_MODE_KEY, mode);
};
