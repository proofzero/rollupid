import { useWindowDimensions } from "react-native";

const useBreakpoint = <T>(wide: T, tall: T, breakpoint = 1600): T => {
  const window = useWindowDimensions();

  return window.width >= breakpoint ? wide : tall;
};

export default useBreakpoint;
