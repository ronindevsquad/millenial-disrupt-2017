import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TextInput,
  ListView,
  Platform,
  Image,
  Dimensions,
  Button,
  StatusBar
} from 'react-native';

import io from 'socket.io-client';

import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc';

const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

const pcPeers = {};

function getLocalStream(isFront, callback) {
  // // console.log("getLocalStream");
  let videoSourceId;

  // on android, you don't have to specify sourceId manually, just use facingMode
  // uncomment it if you want to specify
  if (Platform.OS === 'ios') {
    MediaStreamTrack.getSources(sourceInfos => {
      // // console.log("sourceInfos: ", sourceInfos);

      for (const i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
          videoSourceId = sourceInfo.id;
        }
      }
    });
  }
  getUserMedia({
    audio: true,
    video: {
      mandatory: {
        minWidth: 640, // Provide your own width, height and frame rate here
        minHeight: 360,
        minFrameRate: 30,
      },
      facingMode: (isFront ? "user" : "environment"),
      optional: (videoSourceId ? [{ sourceId: videoSourceId }] : []),
    }
  }, function (stream) {
    // console.log('getUserMedia success', stream);
    callback(stream);
  }, logError);
}

function join(roomID) {
  // // console.log("*********************************");
  //// // console.log(container.socket);
  container.socket.emit('join', roomID, function (socketIds) {
    // // console.log('join', socketIds);
    for (const i in socketIds) {
      const socketId = socketIds[i];
      createPC(socketId, true);
    }
  });
}

function createPC(socketId, isOffer) {
  const pc = new RTCPeerConnection(configuration);
  pcPeers[socketId] = pc;

  pc.onicecandidate = function (event) {
    // console.log('onicecandidate', event.candidate);
    if (event.candidate) {
      container.socket.emit('exchange', { 'to': socketId, 'candidate': event.candidate });
    }
  };

  function createOffer() {
    pc.createOffer(function (desc) {
      // console.log('createOffer', desc);
      pc.setLocalDescription(desc, function () {
        // console.log('setLocalDescription', pc.localDescription);
        container.socket.emit('exchange', { 'to': socketId, 'sdp': pc.localDescription });
      }, logError);
    }, logError);
  }

  pc.onnegotiationneeded = function () {
    // console.log('onnegotiationneeded');
    if (isOffer) {
      createOffer();
    }
  }

  pc.oniceconnectionstatechange = function (event) {
    // console.log('oniceconnectionstatechange', event.target.iceConnectionState);
    if (event.target.iceConnectionState === 'completed') {
      setTimeout(() => {
        getStats();
      }, 1000);
    }
    if (event.target.iceConnectionState === 'connected') {
      createDataChannel();
    }
  };
  pc.onsignalingstatechange = function (event) {
    // console.log('onsignalingstatechange', event.target.signalingState);
  };

  pc.onaddstream = function (event) {
    // console.log('onaddstream', event.stream);
    // // console.log(container, "onaddstream");
    container.setState({ info: '' });

    const remoteList = container.state.remoteList;
    remoteList[socketId] = event.stream.toURL();
    // // console.log(container, "onaddstream2")
    container.setState({ remoteList: remoteList });
  };
  pc.onremovestream = function (event) {
    // console.log('onremovestream', event.stream);
  };

  pc.addStream(container.localstream);
  function createDataChannel() {
    if (pc.textDataChannel) {
      // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
      return;
    }
    const dataChannel = pc.createDataChannel("text");

    dataChannel.onerror = function (error) {
      // console.log("dataChannel.onerror", error);
    };

    dataChannel.onmessage = function (event) {
      // console.log("dataChannel.onmessage:", event.data);
      container.receiveTextData({ user: socketId, message: event.data });
    };

    dataChannel.onopen = function () {
      // console.log('dataChannel.onopen');
      container.setState({ textRoomConnected: true });
    };

    dataChannel.onclose = function () {
      // console.log("dataChannel.onclose");
    };

    pc.textDataChannel = dataChannel;
  }
  return pc;
}

function exchange(data) {
  const fromId = data.from;
  let pc;
  if (fromId in pcPeers) {
    pc = pcPeers[fromId];
  } else {
    pc = createPC(fromId, false);
  }

  if (data.sdp) {
    // // console.log('exchange sdp', data);
    pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
      if (pc.remoteDescription.type == "offer")
        pc.createAnswer(function (desc) {
          // // console.log('createAnswer', desc);
          pc.setLocalDescription(desc, function () {
            // // console.log('setLocalDescription', pc.localDescription);
            container.socket.emit('exchange', { 'to': fromId, 'sdp': pc.localDescription });
          }, logError);
        }, logError);
    }, logError);
  } else {
    // // console.log('exchange candidate', data);
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}

function leave(socketId) {
  // // console.log('leave', socketId);
  const pc = pcPeers[socketId];
  const viewIndex = pc.viewIndex;
  pc.close();
  delete pcPeers[socketId];

  const remoteList = container.state.remoteList;
  delete remoteList[socketId]
  container.setState({ remoteList: remoteList });
  container.setState({ info: '' });
}

function logError(error) {
  // // console.log("logError", error);
}

function mapHash(hash, func) {
  const array = [];
  for (const key in hash) {
    const obj = hash[key];
    array.push(func(obj, key));
  }
  return array;
}

function getStats() {
  const pc = pcPeers[Object.keys(pcPeers)[0]];
  if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
    const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
    // // console.log('track', track);
    pc.getStats(track, function (report) {
      // // console.log('getStats report', report);
    }, logError);
  }
}

let container;

const Call = React.createClass({
  getInitialState() {
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => true });
    return {
      info: 'Initializing',
      status: 'init',
      isFront: true,
      selfViewSrc: null,
      remoteList: {},
      textRoomConnected: false,
      textRoomData: [],
      textRoomValue: '',
      background:'#F5FCFF'
    };
  },
  receiveTextData(data) {
    // console.log("******************************************");
    // console.log(data);
    screenProps.emotions = data;
  },
  componentDidMount() {
    // // console.log("*****************************");
    container = this;
    this.socket = io.connect('https://react-native-webrtc.herokuapp.com', { transports: ['websocket'] });
    // console.log("connect1");
    this.textSocket = io.connect('https://anvyl.online', { transports: ['websocket'] });
    screenProps.textSocket = this.textSocket;
    // console.log("connect2");

    this.socket.on('exchange', function (data) {
      exchange(data);
    });
    this.socket.on('leave', function (socketId) {
      leave(socketId);
    });
    this.socket.on('connect', function (data) {
      // // console.log('connect');
      getLocalStream(true, function (stream) {
        container.localstream = stream;
        container.setState({ selfViewSrc: stream.toURL() });
        container.setState({ status: 'ready', info: 'Click here to join call' });
      });
    });

    this.textSocket.on('faces', function (data) {
      screenProps.emotions = data[0].emotions;
      screenProps.emotions.monica = data[0].emojis.dominantEmoji;
    });
  },
  _press(event) {
    this.setState({ status: 'connect', info: 'Your conversation will start soon', background:'black'});
    // // // console.log(this.state);
    // // // console.log(this.socket);
    join("RoninDevSquad2", this.socket);
  },
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <StatusBar hidden backgroundColor={this.state.background}/>
        <View style={{flex:1}}>
          <View style={styles.container}>
            {this.state.status == 'ready' ?
              (<View style={{alignItems:'center'}}>
                <Button
                  onPress={this._press}
                  title="Join call"
                />
              </View>) :
              (<Text style={styles.welcome}>
                {this.state.info}
              </Text>)
            }
            {
              mapHash(this.state.remoteList, function (remote, index) {
                return <RTCView objectFit='cover' key={index} streamURL={remote} style={styles.remoteView} />
              })
            }
          </View>
        </View>
        <TouchableHighlight
            style={{position:'absolute', bottom:15, left:0, right:0, justifyContent:'center', alignItems:'center'}}
            onPress={()=>{navigate('Analysis')}
          }>
          <Image
            source={require('../assets/close.png')}
            style={styles.exitButton}/>
        </TouchableHighlight>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  selfView: {
    width: 200,
    height: 40,
  },
  remoteView: {
    flex:2,
    zIndex: -5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 0,
  },
  listViewContainer: {
    height: 40,
  },
  exitButton: {
    height: 30,
    width: 30,
    zIndex: -10
  },
});

export default Call;
/*

*/
//
//
// AppRegistry.registerComponent('RCTWebRTCDemo', () => RCTWebRTCDemo);
