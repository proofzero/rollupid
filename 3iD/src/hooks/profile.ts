import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { getSDK } from "../provider/kubelt";
import { fetchProfile } from "../services/threeid";
import { Profile } from "../services/threeid/types";
import useAccount from "./account";

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
      try {
        const sdk = await getSDK();

        const persistedProfile = await fetchProfile(sdk);
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
    };

    if (account) {
      asyncFn();
    }
  }, [account]);

  return profile;
};

export default useProfile;
