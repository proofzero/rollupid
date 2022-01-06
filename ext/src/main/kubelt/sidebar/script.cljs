(ns kubelt.sidebar.script
  "Sidebar business logic."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

;; TODO should this be a shared worker to allow access from both the
;; sidebar and the script injected into the page?

(defn init-worker
  [file-name]
  (let [worker (js/Worker. file-name)]
    (.. worker (addEventListener "message" (fn [e] (js/console.log e))))
    worker))

(defn init []
  (let [worker (init-worker "worker.js")]
    (.. worker (postMessage "hello world"))))

;; var myWindowId;
;; const contentBox = document.querySelector("#content");

;; /*
;; Make the content box editable as soon as the user mouses over the sidebar.
;; */
;; window.addEventListener("mouseover", () => {
;;   contentBox.setAttribute("contenteditable", true);
;; });

;; /*
;; When the user mouses out, save the current contents of the box.
;; */
;; window.addEventListener("mouseout", () => {
;;   contentBox.setAttribute("contenteditable", false);
;;   browser.tabs.query({windowId: myWindowId, active: true}).then((tabs) => {
;;     let contentToStore = {};
;;     contentToStore[tabs[0].url] = contentBox.textContent;
;;     browser.storage.local.set(contentToStore);
;;   });
;; });

;; /*
;; Update the sidebar's content.

;; 1) Get the active tab in this sidebar's window.
;; 2) Get its stored content.
;; 3) Put it in the content box.
;; */
;; function updateContent() {
;;   browser.tabs.query({windowId: myWindowId, active: true})
;;     .then((tabs) => {
;;       return browser.storage.local.get(tabs[0].url);
;;     })
;;     .then((storedInfo) => {
;;       contentBox.textContent = storedInfo[Object.keys(storedInfo)[0]];
;;     });
;; }

;; /*
;; Update content when a new tab becomes active.
;; */
;; browser.tabs.onActivated.addListener(updateContent);

;; /*
;; Update content when a new page is loaded into a tab.
;; */
;; browser.tabs.onUpdated.addListener(updateContent);

;; /*
;; When the sidebar loads, get the ID of its window,
;; and update its content.
;; */
;; browser.windows.getCurrent({populate: true}).then((windowInfo) => {
;;   myWindowId = windowInfo.id;
;;   updateContent();
;; });
