import React, { Component } from 'react';
import { AppRegistry, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';

import HomeScreen from './components/homescreen.js';
import Component2 from './components/component2.js';

export default class Monicall extends Component {
  render() {
    return (
      <MainNavigator/>
    );
  }
}

const MainNavigator = StackNavigator(
  {
    HomeScreen: { screen: HomeScreen },
    Component2: { screen: Component2 },
  },
  {
    cardStyle: { backgroundColor: 'white' },
    // headerMode: 'none',
    initialRouteName: 'HomeScreen'
  }
);

AppRegistry.registerComponent('Monicall', () => Monicall);
