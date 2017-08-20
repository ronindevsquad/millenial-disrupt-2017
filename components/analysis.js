import React, { Component } from 'react';
import { Text, View, Image, ListView } from 'react-native';

import users from '../samples/users';
// Replace with hardcoded psy data

export default class Analysis extends Component {
	constructor(props) {
		super(props);

		this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			name: screenProps.name,
			dataSource: this.ds.cloneWithRows(users)
		};
	}
	componentDidMount() {
		console.log(screenProps);
	}
	render() {
		return (
			<View style={{flex:1}}>
				<View style={{ flex: 0.05, flexDirection:'row', padding:25}}>
					<Text style={{flex: 0.5, fontSize:20, paddingVertical:10}}>Monicall</Text>
					<Image source={require('../assets/icon.png')} style={{width:50,height:50}}/>
				</View>
				<View>
					<Text>{this.state.name}</Text>
				</View>
			</View>
		);
	}
}
