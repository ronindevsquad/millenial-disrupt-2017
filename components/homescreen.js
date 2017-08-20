import React, { Component } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';

export default class HomeScreen extends Component {
	static navigationOptions = {
		title: "Home Screen",
		header: null,
	}
	render() {
		const {navigate} = this.props.navigation;
		return (
			<View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
				<View style={{height:20}}></View>
				<Text>Monicall</Text>
				<Button title="Start" onPress={() => {
					navigate('Component2')
				}}/>
			</View>
		);
	}
}
