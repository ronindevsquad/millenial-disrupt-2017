import React, { Component } from 'react';
import { Text, View, Button, StyleSheet, Image } from 'react-native';

export default class HomeScreen extends Component {
	static navigationOptions = {
		title: "Home Screen",
		header: null,
	}

	render() {
		const { navigate } = this.props.navigation;
		return (
			<View style={{ flex: 1, alignItems: 'center' }}>
				<View style={{ height: 20 }}></View>
				<View style={{flex:0.95, flexDirection:'row'}}>
					<View style={{flex:0.5, alignItems:'center'}}>
						<View style={{flex:0.1}}></View>
						<Text style={{fontSize:20}}>Monicall</Text>
					</View>
					<View style={{flex:0.5, alignItems:'center'}}>
						<View style={{flex:0.1}}></View>
						<Image style={{width:75, height:75}} source={require('../assets/icon.png')}/>
					</View>
				</View>
				<View style={{flex:0.05, flexDirection:'row', alignItems:'flex-start'}}>
					<View style={{flex:0.5, alignItems:'center'}}>
						<Button title="Call" onPress={() => {
							navigate('Call')
						}} />
					</View>
					<View style={{flex:0.5, alignItems:'center'}}>
						<Button title="Analysis" onPress={() => {
							navigate('Analysis')
						}} />
					</View>
				</View>
			</View>
		);
	}
}
