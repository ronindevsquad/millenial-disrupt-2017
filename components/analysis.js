import React, { Component } from 'react';
import { Text, View, Image, ListView, StyleSheet } from 'react-native';
import Emoji from 'react-native-emoji';

import emotions from '../samples/emotions';
// Replace with hardcoded psy data

export default class Analysis extends Component {
	constructor(props) {
		super(props);

		this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
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
					style={{padding:20}}
					renderRow={(rowData, sectionID, rowID) => (
						<View style={{flexDirection:'row'}}>
							<Text style={{flex:0.5, fontSize:16}}>{rowData[0].toUpperCase()+rowData.slice(1)}</Text>
							<Text style={{flex:0.5, fontSize:16}}>: {!isNaN(emotions[screenProps.name][rowData]) ?
								 emotions[screenProps.name][rowData] :
								 (<Emoji name={emotions[screenProps.name][rowData]}/>)
								 }</Text>
					 </View>
					)}>
				</ListView>
			</View>
		);
	}
}

const styles = {
}
