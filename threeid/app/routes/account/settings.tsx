import type { LoaderFunction, ActionFunction } from "@remix-run/cloudflare";

import styles from "~/styles/settings.css";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader: LoaderFunction = () => {
  //* TODO: fetch user's profile here and pass to component
};

export const action: ActionFunction = ({ request }) => {
  //* TODO: update user's profile information
};

export type Profile = {
  nickname?: string;
  profilePicture?: {
    collectionTokenId: string;
    collectionId?: string;
    name: string;
    imageUrl: string;
  };
  email?: string;
  location?: string;
  job?: string;
  website?: string;
  bio?: string;
  socials?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
};

export default function Settings() {
  const emptyProfile: Profile = {
    nickname: "",
    bio: "",
    job: "",
    location: "",
    website: "",
    email: "",
  };
  return (
    <div className="view flex-1 bg-white">
      <div className="view flex-row justify-between items-start">
        <div className="settings-header">Profile</div>
        <div className="button">
          <button className="textButton"> Save all Changes </button>
        </div>
      </div>
      <div className="view">
        <div className="view flex-row">
          <div className="view flex-1">
            <label> Nickname </label>
            <div className="view">
              <input
                className="textInput"
                type="text"
                defaultValue={"Your Nickname"}
              />
            </div>
          </div>
        </div>

        <div className="view flex-row">
          <div className="view flex-1">
            <label> Job </label>
            <div className="view">
              <input
                className="textInput"
                type="text"
                defaultValue={"Your job"}
              />
            </div>
          </div>
        </div>

        <div className="view flex-row">
          <div className="view flex-1">
            <div> Location </div>
            <div className="view">
              <input
                className="textInput"
                type="text"
                defaultValue={"Your location"}
              />
            </div>
          </div>
        </div>

        <div className="view flex-row">
          <div className="view flex-1">
            <div> Website </div>
            <div className="view">
              <input
                className="textInput"
                type="text"
                defaultValue={"Website"}
              />
            </div>
          </div>
        </div>

        <div className="view flex-row">
          <div className="view flex-1">
            <div> Email </div>
            <div className="view">
              <input
                className="textInput"
                type="text"
                defaultValue={"Your email"}
              />
            </div>
          </div>
        </div>

        <div className="view flex-row">
          <div className="view flex-1">
            <div> Bio </div>
            <div className="view">
              <div>
                <textarea defaultValue={"hello"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
