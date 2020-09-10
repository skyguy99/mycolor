import React from 'react';
import {useRef} from 'react';
import { Component, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-community/async-storage"
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { FloatingMenu } from 'react-native-floating-action-menu';
import { Jiro } from 'react-native-textinput-effects';
import MaskedView from '@react-native-community/masked-view';
import * as Progress from 'expo-progress';
import LottieView from "lottie-react-native";
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
  const colorMenuItems = [
    { label: '', header: 'orange', color: '#fca500', darkerColor: '#AF7300', shareLink: '', attributes: 'Optimistic, Friendly, Perceptive',
    bodyText: '\nOptimism and friendliness characterize people, like you, whose personality color is Orange. \n\n You are friendly and nurturing, but may need to take care that your good nature doesn’t lead others to unload all their frustrations on you without any reciprocation. \n\nPeople whose personality color is Orange aren’t typically big party people. You prefer smaller gatherings where you can engage with everyone else. You’re whimsical and value zaniness in others. You’re also bubbly, in an infectious, happy, joyful way. You see the best in people, despite what others may say about them. And you’re a forgiver—to a fault. As a hopeless romantic, breaking connections is difficult for you. \n\nWhen you open your heart, it’s all or nothing. This means you love deeper, but also that heartbreak hurts more. You may never stop loving former flames, with hopes of one day rekindling. But you are never opposed to new opportunities for love and connection.\n\n'},

    { label: '', header: 'blue', color: '#0081d1', darkerColor: '#00578D', shareLink: '', attributes: 'Dependable, Practical, Directive',
    bodyText: '\nDependability is a key feature that characterizes people, like you, whose personality color is blue. \n\nBlues tend to be rule-following, dependable, long-enduring, and tenacious. You make sacrifices in order to rise up the ranks in the world. You put in the extra hours in the office. You always fill out your taxes and pay your bills on time. You have a plan that you stick to. You never stand people up and are always timely. Most importantly, you’re there for your loved ones when they need you most. You lend an ear, do favors, and don’t disappoint. You don’t cheat and try to be 100% honest in all aspects of life. \n\nYou value honesty above all. You might miss out on fun once and a while, due to your discipline. But in your mind, it’s worth it in the long-run. One night of partying isn’t worth not being at your best for work in the morning. You like routines and outlines, things that maintain structure. Organization is key to the way you operate; it’s what makes you staunch, loyal, and trustworthy.\n\n'},

    { label: '', header: 'green', color: '#6fa229', darkerColor: '#47651D', shareLink: '', attributes: 'Peaceful, Serene, Accommodating',
    bodyText: '\nPeacefulness and tranquility characterize people, like you, whose personality color is green. \n\nAs a Green, you are known for your chill vibes, and your body is rarely consumed with anxiety. Chores, work, and even exercise is easier when you are well rested and relaxed. \n\nYour life is centered around achieving maximum comfort, whether it’s investing in luxuries like massage chairs and water beds or meditating and productively removing stress from your body. You’re a deep sleeper and everything is better when it can be done from the comfort of your bed. Confrontation is not a part of your lifestyle. You prefer when issues resolve themselves or require minimal input and stress on your part. Accommodation is where you thrive—allowing others to achieve their peace without interrupting yours. Your chillness and cool, calm, collected way of composing yourself is attractive to a lot of people, but also means that you don’t take some things seriously that deserve uninterrupted attention.\n\n'},

    { label: '', header: 'grey', color: '#939598', darkerColor: '#5C5D5F', shareLink: '', attributes: 'Powerful, Mysterious, Provocative',
    bodyText: '\nPower and mystery are dominant factors that characterize people, like you, whose personality color is Grey. \n\nAs a Grey, you know no fear—and no limits. You like to keep people guessing. People crave mystery and uncertainty—they want to find out more about you. But you won’t let them; you never let anyone get too close, to fully discover who you are. \n\nYou have an air of aloofness; you play coy and hard to get. Never the one to initiate, you attract all sorts of invitations to various events from those around you. You value solitude, reflection, and privacy. An eclectic grouping of interest takes up your time, which exposes you to all sorts of different crowds. You enjoy exhilarating activities, living life on the edge at times. Cavalier and brash, but collected, is how you live your life. You don’t care about the judgement of others and make decisions for yourself and yourself alone. This may mean that you have trouble with intimacy, but it doesn’t mean you don’t have romantic interests. Perhaps they just don’t last very long, or maybe your loved one is the only person you aren’t a mystery to.\n\n'},

    { label: '', header: 'crimson', color: '#d12b51', darkerColor: '#901F39', shareLink: '', attributes: 'Adventurous, Bold, Direct',
    bodyText: '\nFriendliness and a love of excitement characterize people, like you, whose personality color is Crimson. \n\nBold, assertive, domineering, craving excitement—it’s how you live your life. You aren’t afraid to tell people exactly what you think, and you certainly don’t hold back in any aspect of your life. Passion and brashness can get you into trouble, but that’s par for the course. \n\nYou are achievement-focused and work hard towards achieving what you desire. Settling down is not on your agenda. Mistakes are made, but life keeps moving forward. \n\nAs a social animal, you don’t mind (and might even thrive on) being the center of attention. Extraverted is an understatement; you love getting to know people and discussing cool new opportunities with them. Popularity is key; your place in society and how people regard you is extremely important to your identity. Everything needs to be efficient, clean, and, most importantly, sleek. You’re the life of the party and the face that brightens up the room.\n\n'},

    { label: '', header: 'purple', color: '#b15de6', darkerColor: '#901F39', shareLink: '', attributes: 'Creative, Expressive, Emotive',
    bodyText: '\nCreativity is the dominant element that characterizes people, like you, whose personality color is purple. \n\nAs a Purple, you are a creative thinker: thoughtful, reflective, maybe even a little quirky. Convention does not influence you. You are a problem solver, but take the road less traveled. You value art and other creative ventures. You’re very expressive verbally, physically, and in the work that you do. Life is whimsical; you leave your options open. Philosophy is important to you, as is existential thinking and maybe even a bit of nihilism. \n\nYou take great pride in the culturally diverse life you live, and the knowledge and respect that you have for all things in the realm of eclectic art. You have a wellspring of creative energy that you channel into productive artistic activity, including travel. You’re skilled with your hands and a true artisan at heart. Some people may criticize your fringy lifestyle, but you are unapologetic.\n\n'},

  ];

  const bodyTexts = {
    'myCOLOR': {body: 'We’ve updated the myCOLOR personality quiz to be more accurate and effective. With the addition of twelve new questions, the quiz results can better determine your personality type and how you can improve your work and social interactions with others. By encouraging your friends and colleagues to take the myCOLOR personality quiz, you’ll be able to leverage your personality’s specific color traits and theirs to strengthen your relationships through better communication and understanding.\n\nUsing our Soulmates.AI technology, our chief scientific advisor, Dr. J. Galen Buckwalter, created a fun quiz that lets you discover the color of your personality, which we call myCOLOR. Learning about your color will give you insights into yourself as well as how you can interact more effectively with others, from family and friends to co-workers and other teammates.\n\nPeople are often surprised to find the color revealed by the quiz is different than the one they assume defines their personality. See if the color you receive reveals new information about your personality by taking the quiz below.\n', topBold: '', buttonLink: 'https://thecolorofmypersonality.com/', buttonTitle: 'Learn more'},

    'yourCOLOR': {body: '', topBold: (username != '') ? `Hi ${username}.\nYour color is ${userColor}. Cheers! \n` : `\n`, buttonLink: '', buttonTitle: 'Share'},

    'Quiz': {body: '', topBold: '', buttonLink: '', buttonTitle: ''},

    'Teams':{body: 'We each have a personality type, wired into us in a way that can’t be denied. It’s who we are. But when we build teams, we have the opportunity to create a dynamic based on the right mix of different types. \n\nThat’s what makes myCOLOR for Teams so powerful. By understanding how people with different personality colors work best together, you can gain insights into crafting the right team for any situation, from work to sports to social events.\n\nFrom the optimism of Oranges to the creativity of Purples to the dependability of Blues, aligning our strengths (and balancing our weaknesses) can result in teams that perform to their maximum potential.\n', topBold: '', buttonLink: 'https://thecolorofmypersonality.com/', buttonTitle: 'Learn more'},

    'Connect': {body: '', topBold: '', buttonLink: 'instagram://user?username=mycolorpersonality', buttonTitle: ''}
  }; //title : body text

  //Functions

  // ****Init
  useEffect(() => {
  //StatusBar.setHidden(true, 'none');

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
             // do the damage
             setUserColor(item);
           }
      });
});

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
        toValue: 200,
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

    console.log('Selecting '+value);
    setCurrentKey(value);

    if(value == 'yourCOLOR' || value == 'myCOLOR' || value == 'Teams')
    {
        setCurrentTextKey(value);
    }

    if(value == 'Quiz')
    {
      toggleQuiz(true);
      console.log('this');
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

    const KeyIsAColor = (key) => {
      return (key == 'purple' || key == 'blue' || key == 'green' || key == 'orange' || key == 'crimson' || key == 'grey');
    }

  const handleItemPress = (item, index) => {
    console.log('pressed item', item.color);
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

  }, 100); //WAS 4200
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

      if(color)
      {
        console.log('**RESULT: '+color);
        console.log(colorMenuItems.filter((item) => item.header === color));
        return colorMenuItems.filter((item) => item.header === color);
      }
      return {color: '#ffffff'}
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
    padding: 24,
    marginTop: hp('5%')
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
    flex: 1, justifyContent: 'center', width: wp('101%')
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
      marginHorizontal: 20,
      paddingLeft: wp('10%'),
      paddingRight: wp('10%'),
      zIndex: 10,
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
      }
});

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
                    <TouchableOpacity onPress={() => {openLink('https://www.ayzenberg.com/')}}><Text style = {[styles.creditsTxt, {fontFamily: 'CircularStd-Black', marginTop: hp('10%')}]}>© a.network.</Text></TouchableOpacity>
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
                            primaryColor={'white'}
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
                                    <Text style={styles.resultTextBig}>{showResult ? resultColor : ''}</Text>
                                      <Progress.Bar isAnimated duration={showResult ? 1000 : 200} progress={showResult ? 0 : (parseInt(currentQuestionIndex + 1) / 21)} color={"#333333"} trackColor={showResult ? getResultColorItem(resultColor)[0].color : "#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
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
                                        <Text style={styles.colorAttributesText}>{showResult ? getResultColorItem(resultColor)[0].attributes : ''}</Text>
                                        <Text style={styles.bodyText}>{showResult ? getResultColorItem(resultColor)[0].bodyText : ''}</Text>
                                        <TouchableOpacity onPress = {() => {
                                              buttonPress('https://thecolorofmypersonality.com/', true, `The color of my personality is ${resultColor}`);
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

                              <Text style={styles.topBold}>
                                {bodyTexts[currentTextKey]?.topBold}
                              </Text>
                              <Text style={styles.bodyText}>
                                {colorMenuItems.filter((item) => item.header === currentTextKey).length > 0 ? colorMenuItems.filter((item) => item.header === currentTextKey)[0].bodyText : bodyTexts[currentTextKey]?.body}
                              </Text>

                                <View style = {{display: (currentKey == 'Teams') ? 'flex' : 'none'}}>
                                <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic'}]}>
                                    “Building teams inclusive of all personalities find themselves creating transformative experiences  - that is the power behind myCOLOR.”{"\n"}
                                    </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/chris-younger/')}}><Text style = {styles.topBold}>- Chris Younger</Text></TouchableOpacity>

                                    <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic'}]}>
                                        {"\n"}"The optimal team for any communications project is the smallest adequate team for the challenge you face. Smallness empowers identity, ownership, agency, nimbleness, speed and efficiency and much more. The challenge in determining your team size is the subjectivity of “adequate to the challenge.” {"\n"}{"\n"}My approach to finding the right team for each project is to start building outward and continually ask myself whether we have what we need to succeed. Diversity across the team - regardless of its size - is a must. And all of this quickly increases the potential size of our adequate team. So because I am a great believer in smallness, I am always asking myself – “can I achieve more than one goal with each person whom I add to the team?” This is where personality assessment tools like My Color can be extremely useful in anticipating how people will get along or perhaps more importantly, coaching the team in how to get along with one another.”{"\n"}
                                        </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/matt-bretz/')}}><Text style = {styles.topBold}>- Matt Bretz</Text></TouchableOpacity>

                                    <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic'}]}>
                                        {"\n"}"My TEAM is made up of people who can fill in the holes. I need a safety net when I walk into a room, and knowing my teammates have my back because they are strongly suited in the areas I am not, is an ideal situation for me.{"\n"}{"\n"}
                                              Knowing what the ask is determines the team; with 9 clubs in a golf bag I need to know which team member to call on to complete what is needed.
                                              {"\n"}{"\n"}Together we are stronger. 1+1 = 4. Our strengths and weaknesses compliment one another. Impenetrable force together. ”{"\n"}
                                        </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/gary-goodman/')}}><Text style = {styles.topBold}>- Gary Goodman</Text></TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress = {() => {
                                      if(currentKey == 'myCOLOR')
                                      {
                                        buttonPress(bodyTexts[currentKey]?.buttonLink, false, '');
                                      } else if(currentKey == 'Teams')
                                      {
                                        buttonPress(bodyTexts[currentKey]?.buttonLink, true, 'Check out myCOLOR Teams');
                                      } else if(currentKey == 'color') //1 color (not me)
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `This is you if the color of your personality is ${currentColor}`);
                                      } else if(currentKey == 'colors') //2 color combo
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `Here's what happens when you put a ${currentColor} and ${secondColor} together`);
                                      } else if (currentKey == 'yourCOLOR') //my color (last time taken under my name)
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `The color of my personality is ${userColor}`);
                                      }
                                    }} style={[styles.button, styles.shadow3]}>
                                  <Text style = {[styles.bodyText, {textAlign: 'center'}]}>{colorMenuItems.filter((item) => item.header === currentTextKey).length > 0 ? 'Share' : bodyTexts[currentTextKey]?.buttonTitle}</Text>
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
