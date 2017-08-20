import React, { Component } from 'react';
import { ListView, Text, View, Image, TouchableHighlight, StyleSheet } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';

import users from '../samples/users';

export default class Home extends Component {
	constructor(props) {
		super(props);

		this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			dataSource: this.ds.cloneWithRows(users)
		};
	}
	static navigationOptions = {
		title: "Home",
		header: null,
	}

	render() {
		const { navigate } = this.props.navigation;
		return (
			<View style={{flex:1}}>
				<View style={{ flex: 0.1, flexDirection:'row', padding:25}}>
					<Text style={{flex: 0.5, fontSize:20, paddingVertical:10}}>Monicall</Text>
					<Image source={require('../assets/icon.png')} style={{width:50,height:50}}/>
				</View>
				<View style={{ flex: 0.8 }}>
					<ListView
						dataSource={this.state.dataSource}
						removeClippedSubviews={false}
						renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator}/> }
						renderRow={(rowData, sectionID, rowID) => (
							<View style={{flexDirection:'row', padding:5, alignItems:'center'}}>
								<Text style={{flex:0.95, fontSize: 16, paddingLeft:10}}>{rowData.name}</Text>
								<View style={{alignItems:'flex-end', flexDirection:'row'}}>
									<TouchableHighlight style={styles.graphicButton}
										onPress={()=>{
											screenProps = {name:rowData.name};
											navigate("Call");
										}}>
										<Image source={require('../assets/pink_phone.png')}
											style={{height:25, width:25}}/>
									</TouchableHighlight>
									<TouchableHighlight style={styles.graphicButton}
										onPress={()=>{
											screenProps = {name:rowData.name};
											navigate("Analysis");
										}}>
										<Image source={require('../assets/pink_analytics.png')}
											style={{height:25, width:25}}/>
									</TouchableHighlight>
								</View>
							</View>
						)}
						style={{ flex: 1 }} />
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	graphicButton: {
		height:30,
		width:30,
		flexDirection: 'row',
		alignItems:'center',
		justifyContent:'center',
	},
	separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
})
