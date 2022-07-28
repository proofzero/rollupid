import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { kbGetProfile } from "../provider/kubelt";
import { Profile } from "../types/Profile";
import useAccount from "./account";
import useSDKAuth from "./sdkAuth";

const emptyProfile: Profile = {
  nickname: "",
  bio: "",
  job: "",
  location: "",
  website: "",
  email: "",
};

const useProfile = () => {
  const account = useAccount();
  const sdkAuth = useSDKAuth();

  const [profile, setProfile] = useState<Profile>(emptyProfile);

  const { getItem, setItem } = useAsyncStorage("kubelt:profile");

  const readItemFromStorage = async () => {
    const item = await getItem();
    const value: Profile = item != null ? JSON.parse(item) : emptyProfile;
    setProfile(value);
  };

  const writeItemToStorage = async (newValue: string) => {
    await setItem(newValue);
    const x: Profile = JSON.parse(newValue);
    setProfile(x);
  };

  useEffect(() => {
    readItemFromStorage();
  }, []);

  useEffect(() => {
    const asyncFn = async () => {
      if (sdkAuth && account) {
        try {
          const persistedProfile = await kbGetProfile(account);
          const patchedProfile = { ...profile, ...persistedProfile };

          setProfile(patchedProfile);

          try {
            await writeItemToStorage(JSON.stringify(patchedProfile));
          } catch (e) {
            console.warn("Failed to write profile to storage");
          }
        } catch (e) {
          console.warn("Failed to retrieve persisted profile");
        }
      } else {
        setProfile(emptyProfile);
      }
    };

    asyncFn();
  }, [account, sdkAuth]);

  return profile;
};

export default useProfile;
