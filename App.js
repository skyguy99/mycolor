import React from 'react';
import {useRef} from 'react';
import { Component, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-community/async-storage"
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import FloatingMenu from './FloatingMenu/components/FloatingMenu';
import * as Progress from 'expo-progress';
import LottieView from "lottie-react-native";
import Svg, { G, Path } from "react-native-svg";
import { Button, Menu, Divider, Provider, RadioButton } from 'react-native-paper';
import { StyleSheet, Text, View, Image, ImageBackground, Share, Animated, Easing, StatusBar, FlatList, SafeAreaView, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Dimensions } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol
} from 'react-native-responsive-screen';

import AssetExample from './AssetExample';
import { quizQuestions } from './quizData';
import { colors } from './colors';
import {
  convertIndexToAnswer,
  checkForTie,
  calculateResultIndex,
  convertIndexToColorName,
} from './answerFunctions';

export default function App() {

  let [fontsLoaded] = useFonts({
        'CircularStd-Book' : require('./assets/CircularStd-Book.ttf'),
        'CircularStd-Black' : require('./assets/CircularStd-Black.ttf'),
        'CircularStd-BookItalic' : require('./assets/CircularStd-BookItalic.ttf'),
        'CircularStd-BlackItalic' : require('./assets/CircularStd-BlackItalic.ttf'),
  });

  //persistent vars
  const [username, setUsername] = useState('');
  const [userColor, setUserColor] = useState('');

  //quiz vars
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [resultProgress, setResultProgress] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);
  const [userAnswers, setUserAnswers] = React.useState({});
  const [resultColor, setResultColor] = React.useState('');
  const [resultAttributes, setResultAttributes] = React.useState('');

  const [backgroundColor, setBackgroundColor] = React.useState(new Animated.Value(0));
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = React.useState(false);
  const [isQuizOpen, setIsQuizOpen] = React.useState(false);

  const [isSelectingSecondColor, setIsSelectingSecondColor] = React.useState(false);
  const [currentColor, setCurrentColor] = React.useState('#fca500');
  const [secondColor, setSecondColor] = React.useState('');

  const [splashOffsetY, setSplashOffsetY] = React.useState(new Animated.Value(0));
  const [creditsOffsetX, setCreditsOffsetX] = React.useState(new Animated.Value(wp('100%')));
  const [containerOffsetY, setContainerOffsetY] = React.useState(new Animated.Value(hp('-200%')));
  const [containerOffsetX, setContainerOffsetX] = React.useState(new Animated.Value(hp('0%')));
  const [quizOffsetX, setQuizOffsetX] = React.useState(new Animated.Value(-wp('100%')));
  const [scrollOffsetX, setScrollOffsetX] = React.useState(new Animated.Value(0));

  const [scaleInAnimated, setScaleInAnimated] = React.useState(new Animated.Value(0));
  const [scaleOutAnimated, setScaleOutAnimated] = React.useState(new Animated.Value(0));
  const [currentWheelWord, setCurrentWheelWord] = React.useState('Extraversion');

  const [bodyText, setBodyText] = React.useState('');
  const [currentKey, setCurrentKey] = React.useState('myCOLOR');
  const [currentTextKey, setCurrentTextKey] = React.useState('myCOLOR');

  const [headerMenu, setHeaderMenu] = React.useState(new Animated.Value(90));
  const [
    headerMenuOptionsVisible,
    setHeaderMenuOptionsVisible,
  ] = React.useState(false);
  const [optionsVisible, setoptionsVisible] = React.useState(false);
  const [optionsHeaderVisible, setoptionsHeaderVisible] = React.useState(true);
  const [spinValue, setSpinValue] = React.useState(new Animated.Value(0));

  const LottieRef = React.useRef(null);
  const [lottieProgress, setLottieProgress] = React.useState(new Animated.Value(0.5));

  const SliderWidth = Dimensions.get('screen').width;
  const colorWheelArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const colorMenuItems = [
    { label: '', header: 'orange', color: '#fca500', darkerColor: '#AF7300', shareLink: '', attributes: 'Optimistic, Friendly, Perceptive', extraversion: 0.9, openness: 0.95, agreeableness: 0.9, integrity: 0.85, stability: 0.2, conscientiousness: 0.75, title: 'The Enthusiast'},

    { label: '', header: 'blue', color: '#0081d1', darkerColor: '#00578D', shareLink: '', attributes: 'Dependable, Practical, Directive', extraversion: 0.3, openness: 0.3, agreeableness: 0.5, integrity: 1.0, stability: 0.8, conscientiousness: 0.9, title: 'The Director'},

    { label: '', header: 'green', color: '#6fa229', darkerColor: '#47651D', shareLink: '', attributes: 'Peaceful, Serene, Accommodating', extraversion: 0.75, openness: 0.7, agreeableness: 0.95, integrity: 0.4, stability: 0.95, conscientiousness: 0.5, title: 'The Peacemaker'},

    { label: '', header: 'grey', color: '#939598', darkerColor: '#5C5D5F', shareLink: '', attributes: 'Powerful, Mysterious, Provocative', extraversion: 0.1, openness: 0.1, agreeableness: 0.1, integrity: 0.9, stability: 0.8, conscientiousness: 0.45, title: 'The Brooder'},

    { label: '', header: 'crimson', color: '#d12b51', darkerColor: '#901F39', shareLink: '', attributes: 'Adventurous, Bold, Direct', extraversion: 0.9, openness: 0.75, agreeableness: 0.1, integrity: 0.9, stability: 0.5, conscientiousness: 0.3, title: 'The Achiever'},

    { label: '', header: 'purple', color: '#b15de6', darkerColor: '#874AAD', shareLink: '', attributes: 'Creative, Expressive, Emotive', extraversion: 0.8, openness: 0.7, agreeableness: 0.9, integrity: 0.5, stability: 0.1, conscientiousness: 0.85, title: 'The Explorer'},

  ];

  var bodyTexts = {
    'myCOLOR': {body: 'We’ve updated the myCOLOR personality quiz to be more accurate and effective. With the addition of twelve new questions, the quiz results can better determine your personality type and how you can improve your work and social interactions with others. By encouraging your friends and colleagues to take the myCOLOR personality quiz, you’ll be able to leverage your personality’s specific color traits and theirs to strengthen your relationships through better communication and understanding.\n\nUsing our Soulmates.AI technology, our chief scientific advisor, Dr. J. Galen Buckwalter, created a fun quiz that lets you discover the color of your personality, which we call myCOLOR. Learning about your color will give you insights into yourself as well as how you can interact more effectively with others, from family and friends to co-workers and other teammates.\n\nPeople are often surprised to find the color revealed by the quiz is different than the one they assume defines their personality. See if the color you receive reveals new information about your personality by taking the quiz below.\n\n', topBold: '', buttonLink: 'https://thecolorofmypersonality.com/', buttonTitle: 'Learn more'},

    'yourCOLOR': {body: '', topBold: (username != '') ? `Hi ${username}.\nYour color is ${userColor}. Cheers! \n` : `\n`, buttonLink: '', buttonTitle: 'Share'},

    'Quiz': {body: '', topBold: '', buttonLink: '', buttonTitle: ''},

    'Teams':{body: 'We each have a personality type, wired into us in a way that can’t be denied. It’s who we are. But when we build teams, we have the opportunity to create a dynamic based on the right mix of different types. \n\nThat’s what makes myCOLOR for Teams so powerful. By understanding how people with different personality colors work best together, you can gain insights into crafting the right team for any situation, from work to sports to social events.\n\nFrom the optimism of Oranges to the creativity of Purples to the dependability of Blues, aligning our strengths (and balancing our weaknesses) can result in teams that perform to their maximum potential.\n\n', topBold: '', buttonLink: 'https://thecolorofmypersonality.com/', buttonTitle: 'Learn more'},

    'Connect': {body: '', topBold: '', buttonLink: 'instagram://user?username=mycolorpersonality', buttonTitle: ''}
  }; //title : body text

  //Functions

  // ****Init
  useEffect(() => {

  AsyncStorage.getItem('username')
    .then((item) => {
         if (item) {
           // do the damage
           setUsername(item);
           //console.log('We remember you! '+username);
         }
    });
    AsyncStorage.getItem('userColor')
      .then((item) => {
           if (item) {
             // dont override otherwise
             if(userColor == '')
             {
               setUserColor(item);
             }
           }
      });

});

const KeyIsAColor = (key) => {
  return colorMenuItems.filter((item) => item.header.toLowerCase() === key.toLowerCase()).length > 0;
}

  function elevationShadowStyle(elevation) {
    return {
      elevation,
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 0.5 * elevation },
      shadowOpacity: 0.2,
      shadowRadius: 0.8 * elevation
    };
  }

  const toggleHeaderMenu = (value) => {

    if (!value) {
      setTimeout(() => {
        setHeaderMenuOptionsVisible(value);
        setoptionsHeaderVisible(true);
        setoptionsVisible(value);
      }, 500);
    }
  };

  const toggleHeader = () => {
    if (headerMenu._value > 120) {
      Animated.spring(headerMenu, {
        toValue: 60,
        bounciness: 0.5,
        useNativeDriver: false,
        speed: 0.2
      }).start(toggleHeaderMenu(false));
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    } else {
      setoptionsHeaderVisible(false);
      setHeaderMenuOptionsVisible(true);
      setoptionsVisible(true);
      Animated.spring(headerMenu, {
        toValue: KeyIsAColor(currentKey.toLowerCase()) ? 240 : 200,
        bounciness: 0.5,
        useNativeDriver: false,
        speed: 0.2
      }).start(toggleHeaderMenu(true));
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  };

//SELECT DROPDOWN
  const handleValueSelect = (value) => {

    //console.log('Selecting '+value);
    setCurrentKey(value);

    if(value == 'yourCOLOR' || value == 'myCOLOR' || value == 'Teams')
    {
        setCurrentTextKey(value);
    }

    if(value == 'Quiz')
    {
      toggleQuiz(true);

    } else if (value == 'Connect')
    {
      openLink('instagram://user?username=mycolorpersonality');
    } else {
      toggleQuiz(false);
    }

    Animated.spring(headerMenu, {
      toValue: 60,
      bounciness: 0.5,
      useNativeDriver: false,
      speed: 0.2
    }).start(toggleHeaderMenu(false));
    Animated.timing(spinValue, {
      toValue: 0,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleMenuToggle = isMenuOpen =>
    setIsMenuOpen(isMenuOpen);

  const Capitalize = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

  const handleItemPress = (item, index) => {
    handleMenuToggle();

    if(!isSelectingSecondColor)
    {
      setCurrentColor(item.color);
    } else {
      setSecondColor(item.color);
    }

    setCurrentKey(Capitalize(item.header));
    setCurrentTextKey(item.header);
  }

  const renderMenuIcon = (menuState) => {
    const { menuButtonDown } = menuState;

    return menuButtonDown
      ? <Image/> //button up
      : <Image/>; //button down
  }

  const endBackgroundColorAnimation = () => {
    Animated.timing(backgroundColor, {
      toValue: 0,
      duration: 1200,
      easing: Easing.easeOut,
      useNativeDriver: false
    }).start(() => {
      //setBackgroundColor(new Animated.Value(0));
    });
  };

  const startBackgroundColorAnimation = () => {

    Animated.timing(backgroundColor, {
      toValue: 180,
      duration: 1200,
      easing: Easing.easeOut,
      useNativeDriver: false
    }).start(() => {
      //endBackgroundColorAnimation();
    });
  };

  const saveName = (name) => {
    AsyncStorage.setItem('username', name);
    setUsername(name);
  };

  const toggleQuiz = (open) => {

    setIsQuizOpen(open);

    Animated.parallel([
        Animated.spring(quizOffsetX, {
          toValue: open ? wp('0%') : -wp('100%'),
          bounciness: 2,
          useNativeDriver: false,
          speed: 1
        }),
        Animated.spring(scrollOffsetX, {
          toValue: open ? wp('100%') : wp('0%'),
          bounciness: 2,
          useNativeDriver: false,
          speed: 1
        })
        ]).start();
  }

  const toggleCredits = () => {
    console.log('credits');
    setIsCreditsOpen(!isCreditsOpen);

    if(currentKey == 'Quiz')
    {
      toggleQuiz(isCreditsOpen);
    }

    Animated.parallel([
        Animated.spring(creditsOffsetX, {
          toValue: isCreditsOpen ? wp('100%') : 0,
          bounciness: 2,
          useNativeDriver: false,
          speed: 1
        }),
        Animated.spring(containerOffsetX, {
          toValue: isCreditsOpen ? wp('0%') : -wp('100%'),
          bounciness: 2,
          useNativeDriver: false,
          speed: 1
        }),
        Animated.timing(lottieProgress, {
            toValue: isCreditsOpen ? 0.5 : 0,
            duration: 400,
            useNativeDriver: true
          })
        ]).start();
      }

    //button functions

    // <Jiro
      //     style={{width: hp('35%'), marginLeft: -50}}
      //     label={'Your name'}
      //     labelStyle={{color: '#F48D10', fontFamily: 'SequelSans-BlackDisp', fontSize: hp('1.5%'), marginLeft: 28}}
      //     borderColor={'#FDE6C9'}
      //     inputPadding={16}
      //     inputStyle={{ color: '#F48D10', fontFamily: 'SequelSans-RomanDisp', fontSize: hp('4.8%'), marginLeft: 28}}
      //     returnKeyType="next"
      //     onSubmitEditing={(textVal) => saveName(textVal.nativeEvent.text)}
      //   />

    const buttonPress = (link, isShare, string) => {

      if(isShare) {
            onShare(link, string);
      } else {
            openLink(link);
      }
    }

  const onShare = async (btnLink, string) => {
        try {
          const result = await Share.share({
            message:
              string +" "+ btnLink
          });
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
            } else {
              // shared
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
          }
        } catch (error) {
          console.log(error.message);
        }
  };

  const openLink = (link) => {
    if(link != '')
    {
      Linking.openURL(link);
    }
  }

  React.useEffect(() => {
    if (backgroundColor._value === 0) {
      startBackgroundColorAnimation();
    }
  }, [backgroundColor, startBackgroundColorAnimation]);

  useEffect(() => {
    const interval = setInterval(() => {

      Animated.parallel([
        Animated.spring(splashOffsetY, {
  				toValue: hp('100%'),
  				bounciness: 1,
  				useNativeDriver: false,
          speed: 1.4
  			}),
        Animated.spring(containerOffsetY, {
  				toValue: hp('-3%'),
  				bounciness: 5,
  				useNativeDriver: false,
          speed: 1.2
  			})
      ]).start();

  }, 0); //WAS 4200
    return () => clearInterval(interval);
  }, []);

    //Quiz functions
    React.useEffect(() => {
      if (resultColor) {
        colors.forEach((color) => {
          if (color.name === resultColor) {
            setResultAttributes(color.attributes);
          }
        });
      }
    }, [resultColor]);

    const mergeObjects = (obj1, obj2) => {
      var objs = [obj1, obj2];
      var result = objs.reduce(function (r, o) {
        Object.keys(o).forEach(function (k) {
          r[k] = o[k];
        });
        return r;
      }, {});
      return result;
    };

    const handleBackPress = (index) => {
      console.log('back quiz');
      setTimeout(() => {
        if (index > 0) {
          setCurrentQuestionIndex(index - 1);
        }
      }, 100);
    }

    const handleOptionPress = (id, index) => {
      setSelectedAnswer(id);
      const answer = convertIndexToAnswer(currentQuestionIndex + 1, index + 1);
      const userAnswersCombined = mergeObjects(userAnswers, {
        [currentQuestionIndex + 1]: answer,
      });

      setUserAnswers(userAnswersCombined);

      const tiedIndexes =
        currentQuestionIndex > 19 ? checkForTie(userAnswers) : [];

      const colorResult =
        currentQuestionIndex > 19
          ? tiedIndexes.length > 1
            ? convertIndexToColorName(tiedIndexes[0])
            : calculateResultIndex(userAnswers)
          : '';
      setResultColor(colorResult);
      setUserColor(colorResult);

      //console.log('Setting user color: '+colorResult);

      AsyncStorage.setItem('userColor', userColor);

      setTimeout(() => {
        if (quizQuestions.length > currentQuestionIndex + 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setShowResult(true);
        }
      }, 100);
    };

    const handleRetakePress = () => {
      console.log('Retake');

      setSelectedAnswer('');
      setCurrentQuestionIndex(0);
      setShowResult(false);
      setUserAnswers({});
      setResultColor('');
      setResultAttributes('');

      setTimeout(() => {
          setResultProgress(1);
      }, 100);
    };

    function getResultColorItem(color) {
        //console.log('**RESULT: '+color);
        //console.log(colorMenuItems.filter((item) => item.header === color));
        return colorMenuItems.filter((item) => item.header === color);
    }

//------------------------------------------------------------------->
  if (!fontsLoaded) {
    return <AppLoading />;
  } else {

const styles = StyleSheet.create({
  shadow1: elevationShadowStyle(5),
  shadow2: elevationShadowStyle(10),
  shadow3: elevationShadowStyle(20),

  button: {
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 24
  },
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    alignItems: 'center',
    overflow: "visible"
  },
  contentContainer:
  {
    flex: 1, justifyContent: 'center', width: wp('101%'), overflow: 'visible'
  },
  scrollContainer: {
    flex: 1,
    marginTop: hp('14%'),
  },
  topBar: {
    marginTop: hp('7%'),
  },
  headerText: {
    fontFamily: 'CircularStd-Black',
    color: 'black',
    fontSize: hp('2.35%'),
    textAlign: 'center'
  },
  bodyText: {
    fontFamily: 'CircularStd-Book',
    color: 'black',
    fontSize: hp('2.35%')
  },
  topBold: {
    fontFamily: 'CircularStd-Black',
    color: 'black',
    fontSize: hp('2.35%')
  },
  splash: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: "cover",
        height: hp('100%'),
        width: wp('100%'),
        zIndex: 10,
      },
  scrollView: {
      paddingLeft: (currentKey == 'yourCOLOR' || (currentKey == 'Quiz' && showResult) || KeyIsAColor(currentKey)) ? 0 : wp('15%'),
      paddingRight: (currentKey == 'yourCOLOR' || (currentKey == 'Quiz' && showResult) || KeyIsAColor(currentKey)) ? 0 : wp('15%'),
      overflow: (currentKey == 'yourCOLOR' || (currentKey == 'Quiz' && showResult) || KeyIsAColor(currentKey)) ? 'visible' : 'hidden'
    },
    creditsBtn: {
      width: wp('20%'),
      height: wp('17%'),
      flex: 1,
      justifyContent: 'flex-start',
      transform: [{translateX: wp('8%')}, {translateY: hp('4.5%')}],
      position: 'absolute',
      zIndex: 5,
    },
    quizParagraph: {
      fontFamily: 'CircularStd-Book',
      color: 'black',
      fontSize: hp('2.35%'),
      },
      question: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: hp('2.35%'),
        marginBottom: hp('7%'),
        marginTop: -hp('7%')
      },
      colorAttributesText: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: hp('2.35%'),
        textTransform: 'capitalize',
        marginTop: hp('2%')
      },
      answer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: hp('3%'),
      },
      resultText: {
        fontFamily: 'CircularStd-Book',
        color: 'black',
        fontSize: hp('2.35%'),
        textAlign: 'center',
        marginTop: -hp('7%')
      },
      resultTextBig: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: hp('5%'),
        textAlign: 'center',
        textTransform: 'capitalize',
        marginBottom: hp('7%')
      },
      retake: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderColor: 'white',
        backgroundColor: 'black',
        borderRadius: 5,
        width: 200,
        alignSelf: 'center',
      },
      creditsContainer: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: "cover",
        height: hp('100%'),
        width: wp('100%'),
        zIndex: 4,
        backgroundColor: 'transparent'
      },
      creditsTxt: {
        fontFamily: 'CircularStd-Book',
        color: 'black',
        fontSize: hp('2.35%'),
        marginTop: hp('10%'),
        padding: wp('14%')
      },
      quizContainer: {
        flex: 1,
        position: 'absolute',
        ...StyleSheet.absoluteFillObject,
      },
      quizContent: {
        justifyContent: 'center',
        padding: wp('14%'),
      },
      dropDown: {
        position: 'absolute',
        zIndex: 5,
        alignSelf: "center",
        marginTop: hp('5.5%'),
        overflow: 'visible',
      },
      elevatedMenuContainer: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        borderRadius: 10,
        elevation: 9,
        marginHorizontal: 10,
        backgroundColor: "white",
        alignItems: "center",
        flex: 1,
        width: wp('47%'),
        alignItems: "center",
        overflow: 'visible'
      },
      arrow: {
        position: 'absolute',
        zIndex: 6,
        transform: [{translateX: wp('17.5%') }, {translateY: hp('7.5%')}]
      },
      pullQuote: {
        fontFamily: 'CircularStd-BlackItalic',
        color: 'black',
        fontSize: hp('3.1%'),
        textAlign: 'left'
      },
      colorWheel:
      {
        height: hp('40%'),
        padding: wp('20%'),
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'visible',
        marginBottom: hp('5%'),
        marginTop: hp('4%')
      }
});

function getColorTextFormatted(color)
{
  if(KeyIsAColor(color))
  {
    return ([

      <View key = {0} pointerEvents='none' style = {{display: (currentKey == 'yourCOLOR' || (currentKey == 'Quiz' && showResult) || KeyIsAColor(currentKey)) ? 'flex' : 'none', backgroundColor: (getResultColorItem(color).length > 0) ? getResultColorItem(color)[0].color : 'transparent', position: 'absolute', height: hp('100%'), width: wp('100.4%'), padding: 0, zIndex: 0, marginTop: -hp('75%')}} ></View>,
      <View style = {{paddingLeft: wp('12%'), paddingRight: wp('12%'), marginTop: hp('3%')}}>
          <Text key = {1} style={[styles.pullQuote, {marginTop: hp('25%')}]}><Text style = {{fontFamily: 'CircularStd-Book', fontSize: hp('2.3%')}}>> </Text>{getResultColorItem(color)[0].title}</Text>
          <Text key = {2} style ={[styles.bodyText, {marginBottom: hp('3%')}]}>{getResultColorItem(color)[0].attributes}</Text>
          <Text key = {3} style = {[styles.bodyText, {marginBottom: hp('1%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Extraversion </Text> {'//'} {getResultColorItem(color)[0].extraversion*100}% </Text>
          <Progress.Bar key = {10} isAnimated duration={700} progress={getResultColorItem(color)[0].extraversion} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {4} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Openness </Text> {'//'} {getResultColorItem(color)[0].openness*100}% </Text>
          <Progress.Bar key = {11} isAnimated duration={700} progress={getResultColorItem(color)[0].openness} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {5} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Agreeableness </Text> {'//'} {getResultColorItem(color)[0].agreeableness*100}%</Text>
          <Progress.Bar key = {12} isAnimated duration={700} progress={getResultColorItem(color)[0].agreeableness} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {6} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Integrity </Text> {'//'} {getResultColorItem(color)[0].integrity*100}% </Text>
          <Progress.Bar key = {13} isAnimated duration={700} progress={getResultColorItem(color)[0].integrity} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {7} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Emotional Stability </Text> {'//'} {getResultColorItem(color)[0].stability*100}% </Text>
          <Progress.Bar key = {14} isAnimated duration={700} progress={getResultColorItem(color)[0].stability} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {8} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Conscientiousness </Text> {'//'} {getResultColorItem(color)[0].conscientiousness*100}% </Text>
          <Progress.Bar key = {15} isAnimated duration={700} progress={getResultColorItem(color)[0].conscientiousness} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {9} >{'\n'}</Text>
      </View>
    ]);
  }
}

const SCALE = {
  // this defines the terms of our scaling animation.
  getScaleTransformationStyle(animated: Animated.Value, startSize: number = 1, endSize: number = 0.99) {
    const interpolation = animated.interpolate({
      inputRange: [0, 1],
      outputRange: [startSize, endSize],
    });
    return {
      transform: [
        { scale: interpolation },
      ],
    };
  },
  // This defines animation behavior we expext onPressIn
 pressInAnimation(animated: Animated.Value, duration: number = 150) {
    animated.setValue(0);
    Animated.timing(animated, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  },
  // This defines animatiom behavior we expect onPressOut
  pressOutAnimation(animated: Animated.Value, duration: number = 150) {
    animated.setValue(1);
    Animated.timing(animated, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  },

};

const SvgComponent = (props) => {

  if(props.id == 0)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
            <Path
              d="M281.51 182.41L213.86 65A447.58 447.58 0 0051.61 237.16L168.89 305a310.31 310.31 0 01112.62-122.59z"
              fill="#e53112"
            />
          </G>
        </G>
      </Svg>
    )
  } else if(props.id == 1)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
            <Path
              d="M444 136.05V0a443.45 443.45 0 00-230.31 65l67.79 117.4A307.32 307.32 0 01444 136.05z"
              fill="#f9ad0a"
            />
          </G>
        </G>
      </Svg>
    )
  } else if(props.id == 2)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
            <Path
              d="M444.31 136.05a307.41 307.41 0 01162.31 46.06l68.44-118.55A443.3 443.3 0 00445.61 0H444v136z"
              fill="#f3f40f"
            />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 3)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M719.6 304.72l119.26-68.86a447.38 447.38 0 00-163.8-172.3l-68.44 118.55A310.29 310.29 0 01719.6 304.72z"
            fill="#4cd71c"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 4)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M838.86 235.86L719.6 304.72a307.55 307.55 0 0133.58 140.2c0 6.36-.21 12.67-.59 18.94h138.26q.38-9.08.37-18.25a443.55 443.55 0 00-52.36-209.75z"
            fill="#38b54e"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 5)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M135.45 444.92A307.56 307.56 0 01168.87 305L51.58 237.32A443.69 443.69 0 000 445.61q0 9.18.38 18.25H136c-.34-6.27-.55-12.58-.55-18.94z"
            fill="#de0037"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 6)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M136 463.86H.38a443.13 443.13 0 0067 217.43l117.91-68.09A307.09 307.09 0 01136 463.86z"
            fill="#db00a0"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 7)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
           d="M752.59 463.86a307.17 307.17 0 01-49.45 149.64L823 682.69a443.09 443.09 0 0067.86-218.83z"
           fill="#2bd49e"
         />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 8)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M703.14 613.5a310.3 310.3 0 01-112.92 103.7l69 119.57A447.85 447.85 0 00823 682.69z"
            fill="#1ba0e0"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 9)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M444.31 753.79H444v137.42h1.66a443.62 443.62 0 00213.64-54.45l-69-119.57a307.41 307.41 0 01-145.99 36.6z"
            fill="#1230df"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 10)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M297.85 716.91l-68.39 118.46A443.24 443.24 0 00444 891.21V753.78a307.44 307.44 0 01-146.15-36.87z"
            fill="#6a02e0"
            fillRule="evenodd"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 11)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M185.29 613.2L67.35 681.29a447.83 447.83 0 00162.11 154.08l68.39-118.46A310.36 310.36 0 01185.29 613.2z"
            fill="#a200e0"
          />
          </G>
        </G>
      </Svg>
    )
  } else {
    return null;
  }
}

//VIEW ELEMENTS ------------------------------------------------------
  return (
    <View style={[styles.container]}>
    <View style={styles.dropDown}>
    <Animated.View
      style={
        (styles.topBar,
        [
          {
            height: headerMenu,
            overflow: "hidden",
            paddingVertical: 5,
          },
        ])
      }
    >
      <View
        style={
          headerMenuOptionsVisible
            ? [styles.elevatedMenuContainer, styles.shadow1]
            : null
        }
      >
        <TouchableOpacity
          onPress={toggleHeader}
          style={{ flexDirection: "row", alignItems: "flex-start" }}
        >
          {optionsHeaderVisible && (
            <Text
              style={[
                styles.headerText,
                styles.shadow1,
                { marginTop: 15 },
              ]}
            >
              {currentKey}
            </Text>
          )}
          {!optionsVisible && !optionsHeaderVisible && (
            <View style={{ width: 120 }} />
          )}
          {optionsVisible && (
            <View style={{ width: 120 }}>
              <Text
                style={[
                  styles.headerText,
                  styles.shadow1,
                  { marginBottom: 10, marginTop: 15 },
                ]}
              >
                {currentKey}
              </Text>
              {Object.keys(bodyTexts).map((val, k) => {
                if (val !== currentKey) {
                  return (
                    <TouchableOpacity
                      key={k}
                      onPress={() => handleValueSelect(val)}
                    >
                      <Text
                        style={[
                          styles.headerText,
                          styles.shadow1,
                          { marginBottom: 10 },
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              })}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
    </View>
    <View pointerEvents='none' style={styles.arrow}>
    <Animated.Image
      style={{
        width: wp("8%"),
        height: wp("8%"),
        transform: [{ rotate: spin }],
      }}
      source={require("./assets/arrow.png")}
    />
    </View>

      <Animated.Image pointerEvents={"none"} style={[styles.splash, { transform: [{translateY: splashOffsetY }]} ]} source={require('./assets/splash2-txt.png')} />
      <Animated.View pointerEvents={"none"} style = {[styles.splash, {zIndex: 9, transform: [{translateY: splashOffsetY }], backgroundColor: backgroundColor.interpolate({
          inputRange: [0, 30, 60, 90, 120, 150, 180],
          outputRange: [
            '#d12b51',
            '#0081d1',
            '#6fa229',
            '#939598',
            '#fca500',
            '#b15de6',
            '#d12b51'
          ],
        }),}]}>
      </Animated.View>

      <Animated.View style={{ transform: [{translateY: containerOffsetY }]}}>
                  <Animated.View style={[styles.creditsContainer, { transform: [{translateX: creditsOffsetX }]}]}>
                    <Text style = {styles.creditsTxt}><Text style={{ fontFamily: 'CircularStd-Black' }}>myCOLOR</Text> was developed by scientific advisor Dr. J. Galen Buckwalter and redesigned as a mobile experience by Skylar Thomas at <Text style={{ fontFamily: 'CircularStd-Black' }}>Ayzenberg Group,</Text> an award winning creative agency based in Pasadena, CA. {'\n'}{'\n'}At Ayzenberg, we continually build bridges not only between our clients and their audiences, but also among disciplines, providing our teams with powerful tools, inspiring work spaces, and a philosophy and methodology based on the virtuous cycle of <Text style={{ fontFamily: 'CircularStd-Black' }}>Listen, Create, and Share. </Text></Text>
                    <TouchableOpacity onPress={() => {openLink('https://www.ayzenberg.com/')}}><Text style = {[styles.creditsTxt, {fontFamily: 'CircularStd-Black', marginTop: hp('3%')}]}>© a.network.</Text></TouchableOpacity>
                  </Animated.View>
                  <TouchableOpacity style = {styles.creditsBtn} onPress={toggleCredits}>
                      <LottieView
                            ref={LottieRef}
                            style={styles.shadow1}
                            source={require('./assets/hamburger.json')}
                            loop={false}
                            progress={lottieProgress}
                          />
                  </TouchableOpacity>
                  <Animated.View style={[styles.contentContainer, { transform: [{translateX: containerOffsetX }]} ]}>

                        <FloatingMenu
                            items={colorMenuItems}
                            isOpen={isMenuOpen}
                            position={"top-right"}
                            borderColor={'white'}
                            primaryColor={KeyIsAColor(currentKey.toLowerCase()) ? currentColor : (currentKey == 'yourCOLOR' ? getResultColorItem(userColor)[0].color : '#ffffff')}
                            buttonWidth={wp('10%')}
                            borderWidth={0}
                            onMenuToggle={handleMenuToggle}
                            onItemPress={handleItemPress}
                            dimmerStyle={{opacity: 0}}
                          />

                          <Animated.View style={[styles.quizContainer, { transform: [{translateX: quizOffsetX }]} ]}>

                      <SafeAreaView style={{flex: 1, marginTop: hp('16%')}}>

                          <ScrollView
                          showsVerticalScrollIndicator= {false}
                          showsHorizontalScrollIndicator= {false}
                          style={{zIndex: 10}}>

                          <View style = {styles.quizContent}>
                                    <Text style={[styles.question, {display: showResult ? 'none' : 'flex'}]}>
                                      {showResult ? '' : quizQuestions[currentQuestionIndex].question}
                                    </Text>
                                    <Text style={styles.resultText}>{showResult ? 'You are...' : ''}</Text>
                                    <Text style={styles.resultTextBig}>{showResult ? userColor : ''}</Text>
                                      <Progress.Bar isAnimated duration={showResult ? 1000 : 200} progress={showResult ? 0 : (parseInt(currentQuestionIndex + 1) / 21)} color={"#333333"} trackColor={showResult ? getResultColorItem(userColor)[0].color : "#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
                                      <View style = {{flexDirection:'row', flexWrap:'wrap'}}>
                                                <TouchableOpacity style= {{marginTop: hp('1.5%'), marginLeft: -wp('3%')}} onPress = {() => showResult ? handleRetakePress() : handleBackPress(currentQuestionIndex)}>
                                                    <View style = {{flexDirection:'row', flexWrap:'wrap'}}>
                                                      <Image style = {{width: wp('8%'), height: wp('8%'), marginTop: -4}} source={require('./assets/arrowLeft.png')} />
                                                      <Text style = {[styles.quizParagraph, styles.shadow1, {fontFamily: 'CircularStd-Black', alignSelf: 'flex-start'}]}>{showResult ? 'Take Again' : 'Back'}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            <Text style={[styles.quizParagraph, {alignSelf: 'flex-start', marginTop: hp('1.5%'), marginLeft: wp('2%')}]}>{showResult ? '' : 'Q' + parseInt(currentQuestionIndex + 1)+"/21"}</Text>
                                      </View>
                                  {showResult ? (
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.colorAttributesText}>{showResult ? getResultColorItem(userColor)[0].attributes : ''}</Text>
                                        <Text style={styles.bodyText}>{showResult ? getResultColorItem(userColor)[0].bodyText : ''}</Text>
                                        <TouchableOpacity onPress = {() => {
                                              buttonPress('https://thecolorofmypersonality.com/', true, `The color of my personality is ${userColor}`);
                                            }} style={[styles.button, styles.shadow3, {display: showResult ? 'flex' : 'none'}]}>
                                          <Text style = {[styles.bodyText, {textAlign: 'center'}]}>Share</Text>
                                        </TouchableOpacity>
                                    </View>

                                  ) : (
                                      <>
                                        {quizQuestions[currentQuestionIndex].answers.map((answer, index) => {
                                          return (
                                            <TouchableOpacity
                                              style={[styles.answer, {flexDirection:'row'}]}
                                              key={index}
                                              onPress={() => handleOptionPress(answer.id, index)}>
                                              <View style={{flexDirection:"row",alignItems:'center'}}>
                                                  <View style={{flex:9}}>
                                                      <Text style = {styles.bodyText}>{answer.value}</Text>
                                                  </View>
                                                  <View style={{flex:1, paddingLeft: wp('2%')}}>
                                                      <RadioButton.Android
                                                        uncheckedColor={"#F0F0F0"}
                                                        color={'black'}
                                                        value="first"
                                                        status={
                                                          answer.id === selectedAnswer ? 'checked' : 'unchecked'
                                                        }
                                                        onPress={() => handleOptionPress(answer.id, index)}
                                                      />
                                                  </View>
                                              </View>
                                            </TouchableOpacity>
                                          );
                                        })}
                                      </>
                                    )}
                            </View>
                            </ScrollView>
                            </SafeAreaView>
                          </Animated.View>
                          <Animated.View style = {[styles.scrollContainer, { transform: [{translateX: scrollOffsetX }]}]}>
                          <SafeAreaView style={{flex: 1, marginBottom: -hp('5%')}}>

                              <ScrollView
                              showsVerticalScrollIndicator= {false}
                              showsHorizontalScrollIndicator= {false}
                              style={styles.scrollView}>

                              <View style = {{display: (currentKey == 'yourCOLOR') ? 'flex' : 'none'}}>
                              {getColorTextFormatted(userColor)}
                              </View>

                              <View style = {{display: KeyIsAColor(currentKey) ? 'flex' : 'none'}}>
                                {getColorTextFormatted(currentKey.toLowerCase())}
                              </View>

                              <View style = {{display: (currentKey == 'myCOLOR') ? 'flex' : 'none'}}>

                              <View style = {styles.colorWheel}>
                                {colorWheelArray.map((prop, key) => {
                                   return (
                                     <TouchableOpacity key={key}
                                     onPressIn={() => {SCALE.pressInAnimation(scaleOutAnimated)}}
                                     onPressOut={() => {SCALE.pressOutAnimation(scaleOutAnimated)}}
                                     style={[SCALE.getScaleTransformationStyle(scaleOutAnimated, 1, 1.14), {justifyContent: 'center', alignItems: 'center'}]}
                                     >
                                       <SvgComponent style = {{position: 'absolute', width: wp('80%'), height: wp('80%'), top: -hp('16%'), left: 0, right: 0, marginLeft: -wp('40%')}} id={key}/>
                                   </TouchableOpacity>
                                   );
                                })}
                                <Text style = {[styles.pullQuote, {width: wp('100%'), textAlign: 'center'}]}>{currentWheelWord}</Text>
                              </View>

                                  <Text style = {styles.pullQuote}><Text style = {{fontFamily: 'CircularStd-Book', fontSize: hp('2.3%')}}>> </Text>What is the COLOR of your personality?{'\n'}</Text>
                                  <Text style = {styles.bodyText}>We’ve updated the myCOLOR personality quiz to be more accurate and effective. With the addition of twelve new questions, the quiz results can better determine your personality type and how you can improve your work and social interactions with others.{'\n'}{'\n'}</Text>
                                  <Text style = {styles.pullQuote}><Text style = {{fontFamily: 'CircularStd-Book', fontSize: hp('2.3%')}}>> </Text>Learning about your color will give you insights into yourself as well as how you can interact more effectively with others</Text>
                                  <Text style = {styles.bodyText}>{'\n'}{'\n'}By encouraging your friends and colleagues to take the myCOLOR personality quiz, you’ll be able to leverage your personality’s specific color traits and theirs to strengthen your relationships through better communication and understanding.{'\n'}{'\n'}</Text>
                                  <Text style = {styles.pullQuote}><Text style = {{fontFamily: 'CircularStd-Book', fontSize: hp('2.3%')}}>> </Text>People are often surprised to find the color revealed by the quiz is different than the one they assume defines their personality.</Text>
                                  <Text style = {styles.bodyText}> {'\n'}{'\n'}Using our Soulmates.AI technology, our chief scientific advisor, Dr. J. Galen Buckwalter, created a fun quiz that lets you discover the color of your personality, which we call myCOLOR. Learning about your color will give you insights into yourself as well as how you can interact more effectively with others, from family and friends to co-workers and other teammates.{'\n'}{'\n'}</Text>
                              </View>


                                <View style = {{display: (currentKey == 'Teams') ? 'flex' : 'none'}}>
                                <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic'}]}>
                                    “Building teams inclusive of all personalities find themselves creating transformative experiences  - that is the power behind myCOLOR.”{"\n"}
                                    </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/chris-younger/')}}><Text style = {styles.pullQuote}><Text style = {{fontFamily: 'CircularStd-Book', fontSize: hp('2.3%')}}>> </Text>Chris Younger</Text></TouchableOpacity>

                                    <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic'}]}>
                                        {"\n"}"The optimal team for any communications project is the smallest adequate team for the challenge you face. Smallness empowers identity, ownership, agency, nimbleness, speed and efficiency and much more. The challenge in determining your team size is the subjectivity of “adequate to the challenge.” {"\n"}
                                        </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/matt-bretz/')}}><Text style = {styles.pullQuote}><Text style = {{fontFamily: 'CircularStd-Book', fontSize: hp('2.3%')}}>> </Text>Matt Bretz</Text></TouchableOpacity>

                                    <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic'}]}> {"\n"} Together we are stronger. 1+1 = 4. Our strengths and weaknesses compliment one another. Impenetrable force together. ”{"\n"}
                                        </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/gary-goodman/')}}><Text style = {styles.pullQuote}><Text style = {{fontFamily: 'CircularStd-Book', fontSize: hp('2.3%')}}>> </Text>Gary Goodman{"\n"}</Text></TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress = {() => {
                                      if(currentKey == 'myCOLOR')
                                      {
                                        buttonPress(bodyTexts[currentKey]?.buttonLink, false, '');
                                      } else if(currentKey == 'Teams')
                                      {
                                        buttonPress(bodyTexts[currentKey]?.buttonLink, true, 'Check out myCOLOR Teams');
                                      } else if(colorMenuItems.filter((item) => item.header === currentTextKey).length > 0) //1 color (not me)
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `This is you if the color of your personality is ${currentTextKey}`);
                                      } else if(currentKey == 'colors') //2 color combo
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `Here's what happens when you put a ${currentColor} and ${secondColor} together`);
                                      } else if (currentKey == 'yourCOLOR') //my color (last time taken under my name)
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `The color of my personality is ${userColor}`);
                                      }
                                    }} >
                                  <Text style = {[styles.pullQuote, {textAlign: 'center'}]}>{colorMenuItems.filter((item) => item.header === currentTextKey).length > 0 ? 'Share' : bodyTexts[currentTextKey]?.buttonTitle}</Text>
                                </TouchableOpacity>
                                <Text>{"\n"}{"\n"}{"\n"}{"\n"}</Text>
                              </ScrollView>
                            </SafeAreaView>
                          </Animated.View>

                    </Animated.View>
            </Animated.View>
      </View>
  );
  }
}
