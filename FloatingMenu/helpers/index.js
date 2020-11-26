import { Platform, StatusBar } from "react-native";
import * as Device from 'expo-device';
import { Design } from "../constants";

const isTablet = () => {
  return (Device.modelName.includes('iPad') || Device.modelName.includes('Tab') || Device.modelName.includes('Pad') || Device.modelName.includes('Fire'));
}


export const isPortrait = () => {
  return Design.window.height >= Design.window.width;
};

export const applyButtonWidth = (width = Design.buttonWidth) => ({
  width,
  height: width,
  borderRadius: width * 0.5,
});

export const applyButtonInnerWidthFirst = (width = Design.buttonWidth) => ({
  width: width / 2,
  height: width,
  borderTopLeftRadius: width * 0.5,
  borderBottomLeftRadius: width * 0.5,
});

export const applyButtonInnerWidthSecond = (width = Design.buttonWidth) => ({
  width: width / 2,
  height: width,
  borderTopRightRadius: width * 0.5,
  borderBottomRightRadius: width * 0.5,
});

export const isIphoneX = () =>
  Platform.OS === "ios" &&
  !Platform.isPad &&
  !Platform.isTVOS &&
  (Design.window.height === 812 ||
    Design.window.width === 812 ||
    Design.window.height === 896 ||
    Design.window.width === 896);

export const ifIphoneX = (iphoneXStyle, regularStyle) => {
  if (isIphoneX()) return iphoneXStyle;

  return regularStyle;
};

export const getStatusBarHeight = (safe) =>
  Platform.select({
    ios: ifIphoneX(safe ? 44 : 30, 20),
    android: StatusBar.currentHeight,
    default: 0,
  });
