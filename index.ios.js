import React, { Component } from 'react';
import { AppRegistry, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';

import Component1 from './components/component1.js';
import Component2 from './components/component2.js';

export default class Monicall extends Component {
  render() {
    return (
      <MainNavigator />
    );
  }
}

const MainNavigator = StackNavigator(
  {
    Component1: { screen: Component1 },
    Component2: { screen: Component2 }
  },
  {
    cardStyle: { backgroundColor: 'white' },
    headerMode: 'none',
    initialRouteName: 'Component1'
  }
);

AppRegistry.registerComponent('Monicall', () => Monicall);
