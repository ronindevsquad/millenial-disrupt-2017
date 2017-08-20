import React, { Component } from 'react';
import { Text, View, Image, ListView, StyleSheet } from 'react-native';
import Emoji from 'react-native-emoji';

import emotions from '../samples/emotions';
// Replace with hardcoded psy data

export default class Analysis extends Component {
	constructor(props) {
		super(props);

		this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		console.log("emotions:",Object.keys(emotions));
		this.state = {
			name: screenProps.name,
			dataSource: this.ds.cloneWithRows(Object.keys(emotions[screenProps.name]))
		};
	}
	componentDidMount() {
		console.log(screenProps);
	}
	render() {
		return (
			<View style={{flex:1}}>
				<View style={{flex:0.15, padding:25, justifyContent:'flex-end'}}>
					<Text style={{fontSize:20}}>{this.state.name}</Text>
				</View>
				<ListView dataSource={this.state.dataSource}
					removeClippedSubviews={false}
					renderRow={(rowData, sectionID, rowID) => (
						<Text>{rowData}: {emotions[screenProps.name][rowData]}</Text>
					)}>
				</ListView>
			</View>
		);
	}
}

const styles = {
}
