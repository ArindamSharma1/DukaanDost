import { useWindowDimensions } from 'react-native';

export const CONTENT_MAX = 640; // keep lists and headers readable on tablets / web
export const SHEET_MAX = 520;

// Layout hints derived from the live window, so rotation and split-screen just work.
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    compact: height < 700 || width < 340, // small or short phones, landscape
    narrow: width < 360,
    wide: width >= 600,
  };
};
