import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Profile } from "../../services/threeid/types";

import type { RootState } from "../store";

type ProfileState = {
  address: string | undefined;
  value: Profile | undefined;
};

const initialState: ProfileState = {
  address: undefined,
  value: undefined,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    set: (state, action: PayloadAction<Profile>) => {
      state.value = action.payload;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    clearSlice: (state) => {
      state = initialState;
    },
  },
});

export const { set, setAddress, clearSlice } = profileSlice.actions;

export const selectNickname = (state: RootState) => {
  return (
    state.profile.value?.nickname ??
    (state.profile?.address
      ? `${state.profile.address.substring(
          0,
          4
        )} ... ${state.profile.address.substring(
          state.profile.address.length - 4
        )}`
      : undefined)
  );
};

export const selectAddress = (state: RootState) => {
  return state.profile.address;
};

export default profileSlice.reducer;
