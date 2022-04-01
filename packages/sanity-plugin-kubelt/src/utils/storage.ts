import { checkDocument } from "./browserDocument";

/**
 * Checks if the current browser environment supports 
 * storing data in session storage. Throws exception
 * if impossible.
 */
export const checkSessionStorage = (): void => {
  checkDocument();

  let sessionStorageValid = false;
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("kubelt_ls_test", "yes");
    if (sessionStorage.getItem("kubelt_ls_test") === "yes") {
      sessionStorage.removeItem("kubelt_ls_test");
      sessionStorageValid = true;
    }
  }

  if (!sessionStorageValid)
    throw new Error(
      "Plugin running in browser context without sessionStorage (missing or disabled)"
    );
};

export default {
  checkSessionStorage,
};
