import React from 'react';
import { Text, View, TouchableWithoutFeedback, TouchableOpacity, Animated, Easing, ImageBackground, Image } from 'react-native';

import FloatingItem from '../FloatingItem';
import { Colors, Design, MenuPositions } from '../../constants';
import { applyButtonWidth, applyButtonInnerWidthFirst, applyButtonInnerWidthSecond } from '../../helpers';

import globalStyles from '../../styles';
import styles from './styles';

var isSelectingSecondColor = false;
global.isinLongPress = false;

class FloatingMenu extends React.PureComponent {
  state = {
    dimmerActive: false,
    menuButtonDown: false,
    itemsDown: {},
    items: [],
    isAnimated: false,
  };

  menuPressAnimation = new Animated.Value(0);
  gradientBackgroundColor = new Animated.Value(0);
  itemPressAnimations = {};
  itemFanAnimations = {};
  dimmerTimeout = null;

  static getDerivedStateFromProps(nextProps, prevState) {
    const { items } = nextProps;

    return {
      ...prevState,
      items: [...items].reverse(),
    };
  }

  endBackgroundColorAnimation = () => {
    Animated.timing(this.gradientBackgroundColor, {
      toValue: 0,
      duration: 15000,
      easing: Easing.easeOut,
      useNativeDriver: false,
    }).start(() => {
      this.gradientBackgroundColor = new Animated.Value(0);
      this.startBackgroundColorAnimation();
    });
  };

  startBackgroundColorAnimation = () => {
    Animated.timing(this.gradientBackgroundColor, {
      toValue: 180,
      duration: 15000,
      easing: Easing.easeOut,
      useNativeDriver: false,
    }).start(() => {
      this.endBackgroundColorAnimation();
    });
  };

  componentDidMount() {
    this.initAnimations();
    this.spring();

    if (this.gradientBackgroundColor._value === 0) {
      this.startBackgroundColorAnimation();
    }
  }

  componentDidUpdate(prevProps) {
    const { isOpen } = this.props;
    const { items } = this.state;

    if (prevProps.items.length !== items.length) {
      this.initAnimations();
    }

    if (prevProps.isOpen && !isOpen) {
      // Close menu
      this.toggleMenu(false);
    } else if (!prevProps.isOpen && isOpen) {
      // Open menu
      this.toggleMenu(true);
    }
  }

  initAnimations = () => {
    const { items } = this.state;

    if (!this.menuPressAnimation)
      this.menuPressAnimation = new Animated.Value(0);
    for (let i = 0; i < items.length; i++) {
      if (!this.itemPressAnimations[i]) {
        this.itemPressAnimations[i] = new Animated.Value(0);
      }
      if (i < items.length && !this.itemFanAnimations[i]) {
        this.itemFanAnimations[i] = new Animated.Value(0);
      }
    }
  };

  handleItemPressIn = (index, animatedValue, useNativeDriver = false) => () => {
    // Animate in
    Animated.timing(animatedValue, {
      toValue: 1.0,
      duration: 14,
      useNativeDriver,
    }).start();

    if (index === null) {
      this.setState({ menuButtonDown: true });
    } else {
      this.setState({ itemsDown: { ...this.state.itemsDown, [index]: true } });
    }
  };

  handleItemPressOut = (
    index,
    animatedValue,
    useNativeDriver = false
  ) => () => {
    // Animate out
    Animated.timing(animatedValue, {
      toValue: 0.0,
      duration: 142,
      useNativeDriver,
    }).start();

    if (index === null) {
      this.setState({ menuButtonDown: false });
    } else {
      this.setState({ itemsDown: { ...this.state.itemsDown, [index]: false } });
    }
  };

  handleItemPress = (index) => () => {
    const { onItemPress } = this.props;
    const { items } = this.state;
    const item = items[index];

    //console.log('Pressing: ', item);

    if (!item) return;

    if (item.onPress) {
      item.onPress(item, index);
    } else if (onItemPress) {
      onItemPress(item, index);
    }
  };

  handleMenuPress = () => {
    const { isOpen, onMenuToggle } = this.props;

    onMenuToggle(!isOpen);

    global.isinLongPress = false;
  };

  handleLongMenuPress = () => {
    const { isOpen, onMenuToggle } = this.props;

    onMenuToggle(true);
    global.isinLongPress = true;

    console.log("long menu press ", global.isinLongPress);
  };

  toggleMenu = (isOpen) => {
    const { openEase, closeEase } = this.props;
    const { items } = this.state;

    const options = {
      toValue: isOpen ? 1.0 : 0.0,
      duration: 142 - Math.max(items.length - 2, 0) * 5,
      tension: 30,
      friction: 5,
      useNativeDriver: true,
    };

    // Fan items
    let totalDelay = 0;
    for (let i = 0; i < items.length; i++) {
      const t = (isOpen ? i : items.length - i - 1) / items.length;
      const ease = isOpen ? openEase(t) : closeEase(t);
      const time = (150 / Math.min(Math.max(items.length, 0), 8)) * i + 160;
      const delay = Math.max(Math.min(time * ease, 300), 0);

      totalDelay = delay + time;

      Animated.delay(delay).start(() => {
        Animated.spring(this.itemFanAnimations[i], options).start();
      });
    }

    // Toggle dimmer
    this.dimmerTimeout && clearTimeout(this.dimmerTimeout);
    if (isOpen) {
      this.setState({ dimmerActive: true });
    } else {
      // Deactivate dimmer after animation completes
      this.dimmerTimeout = setTimeout(() => {
        this.setState({ dimmerActive: false });
      }, totalDelay);
    }
  };

  //Animate button size
  onSpringCompletion = () => {
    Animated.parallel([
      Animated.spring(this.buttonSizeAnimated, {
        useNativeDriver: false,
        toValue: Design.buttonWidth * 0.9,
        speed: 10,
        bounciness: 0.5,
      }),
      Animated.spring(this.splitButtonSizeAnimated, {
        useNativeDriver: false,
        toValue: Design.buttonWidth * 0.5 * 0.9,
        speed: 10,
        bounciness: 0.5,
      }),
    ]).start(() => {
      this.spring();
    });
  };

  spring = () => {
    Animated.parallel([
      Animated.spring(this.buttonSizeAnimated, {
        useNativeDriver: false,
        toValue: Design.buttonWidth * 1.05,
        speed: 10,
        bounciness: 0.5,
      }),
      Animated.spring(this.splitButtonSizeAnimated, {
        useNativeDriver: false,
        toValue: Design.buttonWidth * 0.5 * 1.05,
        speed: 10,
        bounciness: 0.5,
      }),
    ]).start(() => {
      this.onSpringCompletion();
    });
  };

  renderItems = () => {
    const {
      isOpen,
      position,
      renderItemIcon,
      buttonWidth,
      innerWidth,
      backgroundColor,
      borderColor,
      iconColor,
      primaryColor,
    } = this.props;
    const { items, itemsDown, dimmerActive } = this.state;

    if (!dimmerActive) return null;

    return items.map((item, index) => {
      if (item.color != primaryColor) {
        return (
          <FloatingItem
            key={`item-${index}`}
            {...item}
            item={item}
            index={index}
            icon={null}
            position={position}
            isOpen={isOpen || dimmerActive}
            backgroundColor={item.color}
            borderColor={item.color}
            iconColor={iconColor}
            primaryColor={item.color}
            selectedColor={primaryColor}
            buttonWidth={buttonWidth}
            innerWidth={innerWidth}
            numItems={items.length}
            itemsDown={itemsDown}
            itemFanAnimations={this.itemFanAnimations}
            itemPressAnimations={this.itemPressAnimations}
            onPress={this.handleItemPress(index)}
            onPressIn={this.handleItemPressIn(
              index,
              this.itemPressAnimations[index]
            )}
            onPressOut={this.handleItemPressOut(
              index,
              this.itemPressAnimations[index]
            )}
            isInLongPress={global.isinLongPress}
          />
        );
      }
    });
  };

  renderMenuButton = () => {
    const {
      renderMenuIcon,
      isOpen,
      backgroundColor: _backgroundColor,
      borderColor: _borderColor,
      iconColor: _iconColor,
      primaryColor,
      buttonWidth,
      innerWidth,
    } = this.props;
    const { menuButtonDown, dimmerActive } = this.state;

    isSelectingSecondColor = primaryColor != "#ffffff";

    const bgColor = _backgroundColor || primaryColor;
    const iconColor = primaryColor;
    //const borderColor = isinLongPress ? 'blue' : _borderColor;
    const borderColor = _borderColor;
    //const backgroundColor = isinLongPress ? 'white' : primaryColor;
    const backgroundColor = primaryColor;

    this.buttonSizeAnimated = new Animated.Value(Design.buttonWidth * 0.9);
    this.splitButtonSizeAnimated = new Animated.Value(
      Design.buttonWidth * 0.9 * 0.5
    );

    const content = renderMenuIcon ? (
      renderMenuIcon({ ...this.state })
    ) : (
      <Text
        style={[
          globalStyles.missingIcon,
          isOpen ? styles.closeIcon : styles.menuIcon,
          { color: menuButtonDown ? "#fff" : iconColor },
        ]}
      >
        {isOpen ? "" : ""}
      </Text>
    );

    return (
      <View
        style={[
          globalStyles.buttonOuter,
          applyButtonWidth(Design.buttonWidth * 0.9),
          { borderColor },
        ]}
      >
        <TouchableOpacity
          style={(globalStyles.button, { flexDirection: "row" })}
          onLongPress={this.handleLongMenuPress}
          onPressIn={this.handleItemPressIn(null, this.menuPressAnimation)}
          onPressOut={this.handleItemPressOut(null, this.menuPressAnimation)}
          onPress={this.handleMenuPress}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <Animated.View
            style={[
              globalStyles.buttonInner,
              applyButtonInnerWidthFirst(innerWidth),
              {
                display: global.lastColor != "transparent" ? "flex" : "none",
                //THIS CONTROLS SPLIT COLOR
                backgroundColor:
                  global.lastColor != "transparent"
                    ? global.lastColor
                    : "transparent",
              },
              isSelectingSecondColor &&
                !dimmerActive &&
                global.lastColor == "transparent" && {
                  width: this.buttonSizeAnimated,
                  height: this.buttonSizeAnimated,
                  borderRadius: Design.buttonWidth * 1.1 * 0.5,
                },
              global.lastColor != "transparent" && !dimmerActive && {
                width: this.splitButtonSizeAnimated,
                height: this.buttonSizeAnimated,
                borderTopLeftRadius: Design.buttonWidth * 1.1 * 0.5,
                borderBottomLeftRadius: Design.buttonWidth * 1.1 * 0.5,
              },
            ]}
          >
            <View
              style={{
                display: "flex",
                width: 20,
              }}
            />
            {content}
          </Animated.View>
          <Animated.View
            style={[
              globalStyles.buttonInner,
              global.lastColor != "transparent"
                ? applyButtonInnerWidthSecond(innerWidth)
                : applyButtonWidth(innerWidth),
              { backgroundColor },
              isSelectingSecondColor &&
                !dimmerActive &&
                global.lastColor == "transparent" && {
                  width: this.buttonSizeAnimated,
                  height: this.buttonSizeAnimated,
                  borderRadius: Design.buttonWidth * 1.1 * 0.5,
                },
              global.lastColor != "transparent" && !dimmerActive && {
                width: this.splitButtonSizeAnimated,
                height: this.buttonSizeAnimated,
                borderTopRightRadius: Design.buttonWidth * 1.1 * 0.5,
                borderBottomRightRadius: Design.buttonWidth * 1.1 * 0.5,
              },
            ]}
          >
            <Image
              style={{
                display: primaryColor == "#ffffff" ? "flex" : "none",
                width: Design.buttonWidth,
                height: Design.buttonWidth,
                marginTop: 14,
              }}
              source={require("../../../assets/rainbowcircle.png")}
            ></Image>
            {content}
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  renderDimmer = () => {
    const { isOpen, dimmerStyle } = this.props;
    const { items, dimmerActive } = this.state;

    const fanAnimation = this.itemFanAnimations[0];
    const opacity =
      fanAnimation &&
      fanAnimation.interpolate({
        inputRange: [0.0, 1.0],
        outputRange: [0.5, 1.0],
        extrapolate: "clamp",
      });

    return dimmerActive && items.length ? (
      <TouchableWithoutFeedback
        disabled={!isOpen}
        onPress={this.handleMenuPress}
      >
        <Animated.View
          style={[globalStyles.dimmer, styles.dimmer, dimmerStyle, { opacity }]}
        />
      </TouchableWithoutFeedback>
    ) : null;
  };

  render = () => {
    const { position } = this.props;

    const [vPos, hPos] = position.split("-");

    return (
      <View style={styles.container} pointerEvents="box-none">
        <View
          style={[
            styles.itemContainer,
            {
              [vPos]: 38,
              [hPos]: 38,
              flexDirection:
                vPos.toLowerCase() === "bottom" ? "column" : "column-reverse",
            },
          ]}
          pointerEvents="box-none"
        >
          {this.renderItems()}
          {this.renderMenuButton()}
        </View>
      </View>
    );
  };
}

FloatingMenu.defaultProps = {
  items: [],
  primaryColor: Colors.primaryColor,
  buttonWidth: Design.buttonWidth,
  innerWidth: Design.buttonWidth-12,
  position: MenuPositions.bottomRight,
  isInLongPress: isinLongPress,
  openEase: t => --t * t * t + 1,
  closeEase: t => t * t * t
};

export default FloatingMenu;
