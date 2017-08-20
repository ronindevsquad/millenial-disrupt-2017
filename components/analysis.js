import React, { Component } from 'react';
import { Text, View, Image, ListView, StyleSheet } from 'react-native';
import Emoji from 'react-native-emoji';

import emotions from '../samples/emotions';
// Replace with hardcoded psy data

export default class Analysis extends Component {
	constructor(props) {
		super(props);

		this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		console.log(this.screenProps);
		this.state = {
			name: screenProps.name,
			dataSource: this.ds.cloneWithRows(Object.keys(emotions[screenProps.name])),
			emotions: emotions[screenProps.name]
		};
		if(screenProps.emotions) {
			for(let i=0; i < 20; i++) {
				console.log("****GOT EMOTION DATA****");
			}
			this.setState({emotions:screenProps.emotions});
		}
		else {
			for(let i=0; i < 20; i++) {
				console.log("****NO EMOTION DATA****");
			}
			this.setState({emotions:emotions[screenProps.name]});
		}
	}
	componentDidMount() {
		console.log(screenProps);
		const component = this;
		screenProps.textSocket.on('faces', function(data){
			if(data[0]) {
				console.log("UPDATE\NUPDATE\NUPDATE\NUPDATE\NUPDATE\NUPDATE\NUPDATE\NUPDATE\NUPDATE\NUPDATE\N");
				let newEmotions = data[0].emotions;
	      newEmotions.monica = data[0].emojis.dominantEmoji;
				console.log(newEmotions);
				component.setState({emotions:newEmotions, dataSource:component.ds.cloneWithRows(Object.keys(newEmotions))});
			}
		});
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
							<Text style={{flex:0.5, fontSize:16}}>: {!isNaN(this.state.emotions[rowData]) ?
								 this.state.emotions[rowData].toFixed(2) :
								 this.state.emotions[rowData]
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
