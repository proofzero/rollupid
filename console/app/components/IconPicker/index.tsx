/**
 * @file app/shared/components/IconPicker/index.tsx
 */

import { useState } from "react";

import { CameraIcon } from "@heroicons/react/24/outline";

// pickIcon
// -----------------------------------------------------------------------------

function pickIcon(setIcon) {
  return (e) => {
    // e.target is the input control that trigger the event.
    const files = e.target.files;
    if (files && files.length > 0) {
      // FileList is *like* an Array but you can't pop().
      const iconFile = files.item(0);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIcon(e.target.result);
      };
      const dataURL = reader.readAsDataURL(iconFile);
    }
  }
};

// IconPicker
// -----------------------------------------------------------------------------

type IconPickerProps = {
  // URL of an existing icon.
  url?: string;
  // Is picker in invalid state?
  invalid?: boolean;
  // An error message to display
  errorMessage?: string;
};

export default function IconPicker({ url, invalid, errorMessage }: IconPickerProps) {
  const [icon, setIcon] = useState(url !== undefined ? url : "");

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = [...e.dataTransfer.files];
    if (files && files.length > 0) {
      const file = files.pop();
      // Ignore dropped files that aren't images.
      if (!file.type.startsWith("image/")) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        // Set the data URL as the <img src="..."/> value.
        setIcon(e.target.result);
      };
      // Read file as data URL, triggering onload handler.
      const icon = reader.readAsDataURL(file);
      e.dataTransfer.clearData();
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const appIcon = (icon !== "") ?
    <img src={icon} alt="Application icon" /> :
    <CameraIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
  ;

  //<input type="hidden" name="icon" value={icon} />

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">Upload Icon (1024×1024)</label>
      <div className="flex flex-col md:flex-row md:gap-4 items-center">
        <div className="flex flex-row gap-4">
          <div
            className="grid w-[64px] h-[64px] place-items-center"
            onDrop={e => handleDrop(e)}
            onDragOver={e => handleDragOver(e)}
            onDragEnter={e => handleDragEnter(e)}
            onDragLeave={e => handleDragLeave(e)}
            >
            {appIcon}
          </div>
          <div className="grid place-items-center">
            <label
              htmlFor="icon-upload"
              className="rounded bg-transparent text-sm border border-gray-300 py-2 px-4 hover:bg-indigo-500 hover:text-white focus:bg-indigo-400"
              >
              <span>Upload</span>
              <input
                type="file"
                id="icon-upload"
                name="icon"
                accept="image/png, image/jpeg"
                className="sr-only"
                onChange={pickIcon(setIcon)}
                />
            </label>
          </div>
        </div>
        {invalid && (
          <div className="text-red-700" id="icon-error">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
