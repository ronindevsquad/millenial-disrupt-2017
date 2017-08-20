import React, { Component } from 'react';
import { Text, Image, View, Button, StyleSheet } from 'react-native';
import { Video } from 'react-native-video';

const MEDIA_URL = 'https://i.imgur.com/KRrOsVr.jpg';

export default class Screen2 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cameraString: "Loading...",
			emotionString: "Analyzing..."
		}
		this.getEmotionData();
	}
	static navigationOptions = {
		title: "Emotion Scan"
	}
	getEmotionData() {
		options = {
			method: 'POST',
			headers: {
				'app_key':'721860a202a76175ee34fef7a088665c',
		    'app_id':'198a0878',
		    'Content-Length':0
			}
		}
		fetch('https://api.kairos.com/v2/media?source='+encodeURIComponent(MEDIA_URL), options).then((response) => {
			console.log(response);
			this.setState({cameraString:"testing"})
			response.json().then((responseJson) => {
				if(responseJson) {
					console.log(responseJson.frames[0].people[0].emotions);
					emotions = responseJson.frames[0].people[0].emotions;
					var readout = "";
					for(let i in emotions) {
						readout += `${i.charAt(0).toUpperCase()+i.slice(1)}: ${emotions[i]} `;
					}
					this.setState({emotionString:readout})
					return responseJson;
				}
				else {
					return "undefined1";
				}
			})
		}).catch((error) => {
			return "error";
		});
	}

	render() {
		return (
			<View style={{flex:1}}>
				<View style={[{flex:0.9},styles.container]}>
					<Image source={{uri:MEDIA_URL, method:"GET"}}>
					</Image>
				</View>
				<View style={[{flex:0.1, },styles.container]}>
					<Text>{this.state.emotionString}</Text>
				</View>
			</View>
		);
	}
}


const styles = StyleSheet.create({
	container: {
		alignItems:'center',
		justifyContent:'center',
		borderWidth:1,
		borderColor:'black',
	}
})
