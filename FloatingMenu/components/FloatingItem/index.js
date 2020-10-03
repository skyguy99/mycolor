import React from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
} from 'react-native';

import { applyButtonWidth } from '../../helpers';

import globalStyles from '../../styles';
import styles from './styles';

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
    } = this.props;
    const { label, labelStyle, isPending, isDisabled } = item;

    const pressAnimation = itemPressAnimations[index];
    const fanAnimation = itemFanAnimations[index];
    const itemDown = itemsDown[index];
    const [vPos, hPos] = position.split('-');
    const multiple = vPos.toLowerCase() === 'bottom' ? 1 : -1;

//CHANGE ITEM COLOR HERE!!!!
    const backgroundColor =
      pressAnimation &&
      pressAnimation.interpolate({
        inputRange: [0.0, 1.0],
        outputRange: [_backgroundColor, item.darkerColor],
      });
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
        outputRange: [`${15 * (numItems - index) * multiple}deg`, '0deg'],
      });
    const oppositeRotate =
      fanAnimation &&
      fanAnimation.interpolate({
        inputRange: [0.0, 1.0],
        outputRange: [`${-15 * (numItems - index) * multiple}deg`, '0deg'],
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
        extrapolate: 'clamp',
      });
    const fastOpacity =
      fanAnimation &&
      fanAnimation.interpolate({
        inputRange: [0.0, 0.8, 1.0],
        outputRange: [0.0, 0.0, 1.0],
        extrapolate: 'clamp',
      });

    let content = null;

    if (isPending)
      content = (
        <ActivityIndicator
          size="small"
          color={_iconColor || primaryColor}
          style={styles.activityIndicator}
        />
      );
    const borderColor = isDisabled
      ? `${_borderColor || primaryColor}80`
      : _borderColor || primaryColor;

    return (
      <Animated.View
        key={`item-${index}`}
        style={[
          globalStyles.buttonOuter,
          applyButtonWidth(buttonWidth),
          {
            opacity,
            transform: fanAnimation
              ? [{ translateX: 0 }, { translateY }, { rotate }, { scale }]
              : [],
            borderColor,
          },
        ]}
      >
        <View style={isDisabled && globalStyles.disabled}>
          <Animated.Text
            style={[
              globalStyles.text,
              styles.itemLabel,
              labelStyle,
              {
                opacity: fastOpacity,
                transform: fanAnimation ? [{ rotate: oppositeRotate }] : [],
                left: hPos.toLowerCase() === 'right' ? -171 : 72,
                textAlign: hPos.toLowerCase() === 'right' ? 'right' : 'left',
              },
            ]}
          >
            {label}
          </Animated.Text>

          <TouchableWithoutFeedback
            style={globalStyles.button}
            disabled={isDisabled || isPending || !isOpen}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
          >
            <Animated.View
              style={[
                globalStyles.buttonInner,
                applyButtonWidth(innerWidth),
                { backgroundColor },
              ]}
            >
              {content}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </Animated.View>
    );
  }
}

export default FloatingItem;
