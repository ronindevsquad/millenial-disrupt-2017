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
  // console.log("getLocalStream");
  let videoSourceId;

  // on android, you don't have to specify sourceId manually, just use facingMode
  // uncomment it if you want to specify
  if (Platform.OS === 'ios') {
    MediaStreamTrack.getSources(sourceInfos => {
      // console.log("sourceInfos: ", sourceInfos);

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
  // console.log("*********************************");
  //// console.log(container.socket);
  container.socket.emit('join', roomID, function (socketIds) {
    // console.log('join', socketIds);
    for (const i in socketIds) {
      const socketId = socketIds[i];
      console.log("*******************************************************");
      console.log("socket id:", socketIds[i]);
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
    // console.log(container, "onaddstream");
    container.setState({ info: 'One peer join!' });

    const remoteList = container.state.remoteList;
    remoteList[socketId] = event.stream.toURL();
    // console.log(container, "onaddstream2")
    container.setState({ remoteList: remoteList });
  };
  pc.onremovestream = function (event) {
    // console.log('onremovestream', event.stream);
  };

  pc.addStream(container.localstream);
  function createDataChannel() {
    if (pc.textDataChannel) {
      return;
    }
    const dataChannel = pc.createDataChannel("text");

    dataChannel.onerror = function (error) {
      console.log("dataChannel.onerror", error);
    };

    dataChannel.onmessage = function (event) {
      // console.log("dataChannel.onmessage:", event.data);
      container.receiveTextData({ user: socketId, message: event.data });
    };

    dataChannel.onopen = function () {
      // console.log('dataChannel.onopen');
      // console.log(container, "onopen")
      container.setState({ textRoomConnected: true });
    };

    dataChannel.onclose = function () {
      console.log("dataChannel.onclose");
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
    // console.log('exchange sdp', data);
    pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
      if (pc.remoteDescription.type == "offer")
        pc.createAnswer(function (desc) {
          // console.log('createAnswer', desc);
          pc.setLocalDescription(desc, function () {
            // console.log('setLocalDescription', pc.localDescription);
            container.socket.emit('exchange', { 'to': fromId, 'sdp': pc.localDescription });
          }, logError);
        }, logError);
    }, logError);
  } else {
    // console.log('exchange candidate', data);
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}

function leave(socketId) {
  // console.log('leave', socketId);
  const pc = pcPeers[socketId];
  const viewIndex = pc.viewIndex;
  pc.close();
  delete pcPeers[socketId];

  const remoteList = container.state.remoteList;
  delete remoteList[socketId]
  container.setState({ remoteList: remoteList });
  container.setState({ info: 'One peer leave!' });
}

function logError(error) {
  // console.log("logError", error);
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
    // console.log('track', track);
    pc.getStats(track, function (report) {
      // console.log('getStats report', report);
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
    };
  },
  componentDidMount() {
    // console.log("*****************************");
    console.log("screenProps:", screenProps);
    container = this;
    this.socket = io.connect('https://react-native-webrtc.herokuapp.com', { transports: ['websocket'] });
    this.socket.on('exchange', function (data) {
      exchange(data);
    });
    this.socket.on('leave', function (socketId) {
      leave(socketId);
    });

    this.socket.on('connect', function (data) {
      // console.log('connect');
      getLocalStream(true, function (stream) {
        container.localstream = stream;
        container.setState({ selfViewSrc: stream.toURL() });
        container.setState({ status: 'ready', info: 'Click here to join call' });
      });
    });
  },
  _press(event) {
    this.setState({ status: 'connect', info: 'Your conversation will start soon' });
    // // console.log(this.state);
    // // console.log(this.socket);
    join("RoninDevSquad", this.socket);
  },
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {this.state.info}
        </Text>

        {this.state.status == 'ready' ?
          (<View style={{alignItems:'center'}}>
            <TouchableHighlight
              onPress={this._press}>
              <Text>Join call</Text>
            </TouchableHighlight>
          </View>) : null
        }
        {
          mapHash(this.state.remoteList, function (remote, index) {
            console.log(remote, index);
            return <RTCView key={index} streamURL={remote} style={styles.remoteView} />
          })
        }
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
    flex: 2,
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
});

export default Call;
//
//
// AppRegistry.registerComponent('RCTWebRTCDemo', () => RCTWebRTCDemo);
