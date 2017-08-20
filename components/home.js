import React, { Component } from 'react';
import { ListView, Text, View } from 'react-native';
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

	render() {
		return (
			<View style={{ flex: 1, padding: 20 }}>
				<ListView
					dataSource={this.state.dataSource}
					removeClippedSubviews={false}
					renderRow={(rowData, sectionID, rowID) => (
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
							<Text style={{ fontSize: 16 }}>{rowData.name}</Text>
							{/* <Icon name="phone" size={30} color="#900" /> */}
						</View>
					)}
					style={{ flex: 1 }} />
			</View>
		);
	}
}