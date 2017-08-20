import React, { Component } from 'react';
import { AppRegistry, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';

import Analysis from './components/analysis.js';
import Call from './components/call.js';
import Home from './components/home.js';
import HomeScreen from './components/homescreen.js';

export default class Monicall extends Component {
  render() {
    return (
      <MainNavigator />
    );
  }
}

const MainNavigator = StackNavigator(
  {
    Analysis: { screen: Analysis },
    Call: { screen: Call },
    Home: { screen: Home },
    HomeScreen: { screen: HomeScreen }
  },
  {
    cardStyle: { backgroundColor: 'white' },
    headerMode: 'none',
    initialRouteName: 'Home'
  }
);

AppRegistry.registerComponent('Monicall', () => Monicall);
