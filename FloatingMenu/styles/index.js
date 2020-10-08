import { StyleSheet } from 'react-native';

import { Colors } from '../constants';

const globalStyles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.6,
    color: Colors.readableBlack,
  },
  link: {
    color: Colors.link,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  disabled: {
    opacity: 0.5,
  },
  dimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffffdd',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  buttonOuter: {
    // width: Design.buttonWidth,
    // height: Design.buttonWidth,
    // borderRadius: Design.buttonWidth * 0.5,
    // borderColor: Colors.primaryColor,
    backgroundColor: '#fff',
    borderWidth: 0,
    marginTop: 14,
    elevation: 5,
    shadowOffset: { width: 0, height: 0.5 * 20 },
    shadowOpacity: 0.2,
    shadowRadius: 0.8 * 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 7
  },

  button: {
    flexDirection: 'row',
  },

  buttonInner: {
    // width: Design.innerWidth,
    // height: Design.innerWidth,
    // borderRadius: Design.innerWidth * 0.5,
    padding: 9,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 7,
    overflow: 'hidden'
  },

  missingIcon: {
    color: Colors.primaryColor,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
});

export default globalStyles;
