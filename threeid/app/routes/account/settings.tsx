import styles from "~/styles/settings.css";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
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
    <div>
      <div>
        <div>Profile</div>
        <button className="button textButton"> Save all Changes </button>
      </div>
      <div className="view">
        <div>
          <div>
            <div> Nickname </div>
            <div>
              <div>
                <input type="text" defaultValue={"Nickname"} />
              </div>
            </div>
          </div>
        </div>

        <div className="view">
          <div>
            <div> Job </div>
            <div>
              <div>
                <input type="text" defaultValue={"Job"} />
              </div>
            </div>
          </div>
        </div>

        <div className="view">
          <div>
            <div> Location </div>
            <div>
              <div>
                <input type="text" defaultValue={"Location"} />
              </div>
            </div>
          </div>
        </div>

        <div className="view">
          <div>
            <div> Website </div>
            <div>
              <div>
                <input type="text" defaultValue={"Website"} />
              </div>
            </div>
          </div>
        </div>

        <div className="view">
          <div>
            <div> Email </div>
            <div>
              <div>
                <input type="text" defaultValue={"hello"} />
              </div>
            </div>
          </div>
        </div>

        <div className="view">
          <div>
            <div> Bio </div>
            <div>
              <div>
                <textarea className="textInput" defaultValue={"hello"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
