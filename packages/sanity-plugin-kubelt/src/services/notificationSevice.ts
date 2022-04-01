import { Notyf } from "notyf";
import { checkDocument } from "../utils/browserDocument";

const notyf = new Notyf({
  duration: 5000,
  position: {
    x: "left",
    y: "bottom",
  },
  types: [
    {
      type: "warning",
      background: "orange",
      icon: {
        // should probably create kubelt__icon--error,
        // but keeping surface area low for now
        // using the background
        className: "notyf__icon--error",
        tagName: "i",
      },
    },
  ],
});

let initializedNotyfCss = false;

/**
 * Currently not so useful, might be removed in the future
 */
const toastNotif = (toast: {
  type: "success" | "error" | "warning";
  message: string;
}) => {
  checkDocument();

  if (!initializedNotyfCss) {
    // Arguably this could be loaded via node_modules
    // but because it's in a library that gets loaded by Sanity
    // it feels like sanity hijaks internal *.css requests
    // and delivers its own html page
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");

    // This is a very small footprint css so
    // could be extracted into plaintext perhaps
    link.setAttribute(
      "href",
      "https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css"
    );
    document.head.appendChild(link);

    initializedNotyfCss = true;
  }

  notyf.open({
    type: toast.type,
    message: toast.message,
  });
};

export default {
  toastNotif,
};
