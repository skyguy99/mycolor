import React from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";

import {
  applyButtonWidth,
  applyButtonInnerWidthFirst,
  applyButtonInnerWidthSecond,
} from "../../helpers";
import globalStyles from "../../styles";
import styles from "./styles";

class FloatingItem extends React.PureComponent {
  render() {
    const {
      item,
      icon,
      index,
      isOpen,
      position,
      numItems,
      itemsDown,
      innerWidth,
      buttonWidth,
      primaryColor,
      itemFanAnimations,
      itemPressAnimations,
      backgroundColor: _backgroundColor,
      borderColor: _borderColor,
      iconColor: _iconColor,
      onPressIn,
      onPressOut,
      onPress,
      isInLongPress,
      selectedColor,
    } = this.props;
    const { label, labelStyle, isPending, isDisabled } = item;

    const pressAnimation = itemPressAnimations[index];
    const fanAnimation = itemFanAnimations[index];
    const itemDown = itemsDown[index];
    const [vPos, hPos] = position.split("-");
    const multiple = vPos.toLowerCase() === "bottom" ? 1 : -1;

    //CHANGE ITEM COLOR HERE!!!!
    //const backgroundColor = isInLongPress ? 'red' : _backgroundColor; //put half and half here
    const backgroundColor = _backgroundColor;

    const translateY =
      fanAnimation &&
      fanAnimation.interpolate({
        inputRange: [0.0, 1.0],
        outputRange: [
          (buttonWidth + 14) * (numItems - index) * 0.5 * multiple,
          0,
        ],
      });
    const rotate =
      fanAnimation &&
      fanAnimation.interpolate({
        inputRange: [0.0, 1.0],
        outputRange: [`${15 * (numItems - index) * multiple}deg`, "0deg"],
      });
    const oppositeRotate =
      fanAnimation &&
      fanAnimation.interpolate({
        inputRange: [0.0, 1.0],
        outputRange: [`${-15 * (numItems - index) * multiple}deg`, "0deg"],
      });
    const scale =
      fanAnimation &&
      fanAnimation.interpolate({
        inputRange: [0.0, 1.0],
        outputRange: [0.8, 1.0],
      });
    const opacity =
      fanAnimation &&
      fanAnimation.interpolate({
        inputRange: [0.0, 0.25, 1.0],
        outputRange: [0.0, 0.0, 1.0],
        extrapolate: "clamp",
      });
    const fastOpacity =
      fanAnimation &&
      fanAnimation.interpolate({
        inputRange: [0.0, 0.8, 1.0],
        outputRange: [0.0, 0.0, 1.0],
        extrapolate: "clamp",
      });

    let content = null;

    const borderColor = isDisabled
      ? `${_borderColor || primaryColor}80`
      : _borderColor || primaryColor;

    return (
      <Animated.View
        key={`item-${index}`}
        style={[
          globalStyles.buttonOuter,
          applyButtonWidth(buttonWidth*0.98),
          {
            opacity,
            transform: fanAnimation
              ? [{ translateX: 0 }, { translateY }, { rotate }, { scale }]
              : [],
            borderColor,
          },
        ]}
      >
        <View style={[isDisabled && globalStyles.disabled]}>
          <TouchableOpacity
            style={[globalStyles.button, {overflow: 'hidden'}]}
            disabled={isDisabled || isPending || !isOpen}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
          >
            <Animated.View
              style={[
                globalStyles.buttonInner,
                applyButtonInnerWidthFirst(innerWidth*1.1),
                {
                  //THIS CONTROLS SPLIT COLOR
                  backgroundColor:
                    isInLongPress && selectedColor !== "#ffffff"
                      ? selectedColor
                      : backgroundColor,
                },
              ]}
            >
              <View
                style={{
                  display: isInLongPress ? "flex" : "none",
                  backgroundColor: "transparent",
                  width: 10,
                }}
              />
              {content}
            </Animated.View>

            <Animated.View
              style={[

                globalStyles.buttonInner,
                applyButtonInnerWidthSecond(innerWidth*1.1),
                { backgroundColor },
              ]}
            >
              <View
                style={{
                  display: isInLongPress ? "flex" : "none",
                  backgroundColor: "transparent",
                  width: 10,
                }}
              />
              {content}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
}

export default FloatingItem;
