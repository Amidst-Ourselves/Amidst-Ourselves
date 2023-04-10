// FR#29 Proximity Voice Chat
import {
    PLAYER_STATE,
    MAP_SCALE,
    MAP1_WALLS,
    VIEW_DISTANCE,
} from "./constants"
const USE_AUDIO = true;
const USE_VIDEO = false;

const MUTE_AUDIO_BY_DEFAULT = false;
const ICE_SERVERS = [
    {urls:"stun:stun.l.google.com:19302"}
];

// Please note: the webRTC implementation borrowed a lot ideas and codes from:
// https://github.com/anoek/webrtc-group-chat-example
export default class webRTCClientManager {
    

    // pass the game roomObj and use the same socket for audio chat
    init(roomObj, socket) {
        try {
            this.signaling_socket = socket;
            this.local_media_stream = null;
            this.peers = {};
            this.peer_media_elements = {};
            this.roomCode = roomObj.roomCode;
            this.roomObj = roomObj;
            this.my_pos = {};
            this.my_x = null;
            this.my_y = null;
            this.isMicrophoneOn = true;
            this.mute_flag = true;
            this.playerStates = {};
            this.wallBetween = {};
        }
        catch(error) {
            console.log("error " + error);
        }
    }
    create() {
        this.signaling_socket.on('my_pos2', this.handleMyPos.bind(this));
        this.setUpMedia(() => this.joinChatRoom(this.roomCode));
        
        this.signaling_socket.on('sessionDescription', this.handleSessionDescription.bind(this));
        
        this.signaling_socket.on('iceCandidate', this.handleIceCandidate.bind(this));
        
        this.signaling_socket.on('removePeer', this.handleRemovePeer.bind(this));
    }
    
    handleMyPos(playerObj) {
        const { id, x, y } = playerObj;
        this.my_pos[id] = this.my_pos[id] || {};
        this.my_pos[id].x = x;
        this.my_pos[id].y = y;
    }
    
    joinChatRoom(roomCode) {
        this.signaling_socket.emit('webRTC_join', { roomCode });
    }
    
    handleSessionDescription(config) {
        try {
            const { peer_id, session_description } = config;
            const peer = this.peers[peer_id];
            const desc = new RTCSessionDescription(session_description);
            peer.setRemoteDescription(desc, () => {
            if (session_description.type === 'offer') {
                peer.createAnswer(
                (answer) => {
                    peer.setLocalDescription(answer, () => {
                    this.signaling_socket.emit('relaySessionDescription', {
                        peer_id,
                        session_description: answer,
                        roomCode: this.roomCode,
                    });
                    });
                },
                (error) => {
                    console.error('Error creating answer:', error);
                }
                );
            }
            });
        } catch (error) {
            console.error('An error occurred:', error.message);
        }
    }
    
    handleIceCandidate(config) {
        try {
            const { peer_id, ice_candidate } = config;
            const peer = this.peers[peer_id];
            peer.addIceCandidate(new RTCIceCandidate(ice_candidate));
        } catch (error) {
            console.error('An error occurred:', error.message);
        }
    }
    
    handleRemovePeer(config) {
        const { peer_id } = config;
        if (peer_id in this.peer_media_elements) {
            this.peer_media_elements[peer_id].remove();
            delete this.peer_media_elements[peer_id];
        }
        if (peer_id in this.peers) {
            this.peers[peer_id].close();
            delete this.peers[peer_id];
        }
        delete this.my_pos[peer_id];
    }


    // add remote audio and 
    update() {
        let global_signaling_socket = this.signaling_socket;


        this.signaling_socket.on('disconnect', () => {
            console.log("received leave");
            this.reset();
        });
        
        try{
            // Create peer-2-peer connection if a new user enter the room
            this.signaling_socket.on('addPeer', (config) => {
                let peer_id = config.peer_id;
                if (peer_id in this.peers) {
                    return;
                }
                var peer_connection = new RTCPeerConnection(
                    {"iceServers": ICE_SERVERS},
                    {"optional": [{"DtlsSrtpKeyAgreement": true}]}
                );
                this.peers[peer_id] = peer_connection;

                peer_connection.onicecandidate = (event) => {
                    if (event.candidate) {
                        this.signaling_socket.emit('relayICECandidate', {
                            'peer_id': peer_id, 
                            'ice_candidate': {
                                'sdpMLineIndex': event.candidate.sdpMLineIndex,
                                'candidate': event.candidate.candidate
                            }, 
                            'roomCode': this.roomCode
                        });
                    }
                }
                


                peer_connection.ontrack = (event) => {


                    try {
                        var remote_media = document.createElement('audio');

                        remote_media.setAttribute("autoplay", "autoplay");

                        if (MUTE_AUDIO_BY_DEFAULT) {
                            remote_media.muted = true;
                        }
                        remote_media.setAttribute("controls", "");
                        this.peer_media_elements[peer_id] = remote_media;
                        const audioContainer = document.getElementById('audio-container2');
                        audioContainer.appendChild(remote_media);
                        this.attachMediaStream(remote_media, event.streams[0]);

                    }
                    catch (error) {
                        // code that handles the error
                        console.error('An error occurred:', error.message);
                    }
                }

                // add local stream
                // TODO: replace deprecated function with newest ones
                // peer_connection.addStream(this.local_media_stream);
                const track = this.local_media_stream.getTracks();
                peer_connection.addTrack(track[0], this.local_media_stream);


                if (config.should_create_offer) {
                    try {
                        //console.log("Creating RTC offer to ", peer_id);
                        // SDP (Session Description Protocol) is the standard describing a 
                        // peer-to-peer connection. SDP contains the codec, source address, 
                        // and timing information of audio and video.
                        peer_connection.createOffer(
                            (session_description) => { 
                                //console.log("Session description is: ", session_description);
                                // The RTCPeerConnection method setLocalDescription() changes the local description 
                                // associated with the connection. This description specifies the properties of the local 
                                // end of the connection, including the media format. The method takes a single parameter—the 
                                // session description—and it returns a Promise which is fulfilled once the description has 
                                // been changed, asynchronously.
                                // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription
                                peer_connection.setLocalDescription(session_description,
                                    () => { 
                                        this.signaling_socket.emit('relaySessionDescription', 
                                            {'peer_id': peer_id, 'session_description': session_description, 'roomCode': this.roomCode});
                                        //console.log("Offer setLocalDescription succeeded"); 
                                    },
                                    () => { console.log("Offer setLocalDescription failed!"); }
                                );
                            },
                            (error) => {
                                console.log("Error sending offer: ", error);
                            });
                    }
                    catch (error) {
                        // code that handles the error
                        console.error('An error occurred:', error.message);
                    }
                }
            });
        }
        catch(error) {
            console.log("error " + error);
        }
    }

    reset() {
        //console.log("Disconnected from signaling server");

        if (this.local_media_stream) {
            // Stop all tracks in the local media stream
            this.local_media_stream.getTracks().forEach((track) => {
              track.stop();
            });
          
            // Stop the local media stream itself
            this.local_media_stream = null;
          }

        for (let peer_id in this.peer_media_elements) {
            this.peer_media_elements[peer_id].remove();
        }
        for (let peer_id in this.peers) {
            const senders = this.peers[peer_id].getSenders();
            senders.forEach(sender => {
                this.peers[peer_id].removeTrack(sender);
            });
            this.peers[peer_id].close();
        }

        this.peers = {};
        this.peer_media_elements = {};
        this.local_media_stream = null;
    }


    attachMediaStream(element, stream) {
        //console.log('DEPRECATED, attachMediaStream will soon be removed.');
        element.srcObject = stream;
    };

    setUpMedia(callback, errorback) {
        
        try {
            if (this.local_media_stream != null) {
                if (callback) callback();
                return; 
            }

            //console.log("Requesting access to local audio / video inputs");


            navigator.getUserMedia = ( navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia);

            this.attachMediaStream = (element, stream) => {
                //console.log('DEPRECATED, attachMediaStream will soon be removed.');
                element.srcObject = stream;
            };

            navigator.mediaDevices.getUserMedia({"audio":USE_AUDIO, "video":USE_VIDEO})
                .then((stream) => {

                    try {
                        this.local_media_stream = stream;

                        const audioContext = new AudioContext();
                        const analyser = audioContext.createAnalyser();
                        const microphone = audioContext.createMediaStreamSource(stream);
                        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
                    
                        analyser.smoothingTimeConstant = 0.8;
                        analyser.fftSize = 1024;
                    
                        microphone.connect(analyser);
                        analyser.connect(scriptProcessor);
                        scriptProcessor.connect(audioContext.destination);
                        let tmp_signaling_socket = this.signaling_socket;
                        let my_x = this.my_x;
                        let my_y = this.my_y;
                        let my_pos = this.my_pos;
                        let my_peers = this.peers;
                        // let my_states = this.playerStates;
                        // console.log(this.playerStates);
                        // while(Object.keys(this.playerStates).length === 0);
                        let my_states = this.playerStates;
                        // console.log(this.playerStates[this.signaling_socket.id]);
                        let my_state = this.playerStates[this.signaling_socket.id].playerState;
                        let local_wallBetween = this.wallBetween;
                        // console.log(my_state);
                        scriptProcessor.onaudioprocess = () => {

                            function m_distance(x1,y1,x2,y2) {
                                return Math.abs(x1 - x2) + Math.abs(y1 - y2);
                            }
                        
                            function updateProximityFlag(ele) {
                                //console.log("proximity")
                                //console.log('my x: ' + my_x);
                                //console.log('target x: ' + my_pos[ele].x);
                                if (my_peers && my_peers[ele]) {
                                    if (m_distance(my_x, my_y, my_pos[ele].x, my_pos[ele].y) > 150 || local_wallBetween[ele] === true) {
                                        let senderList = my_peers[ele].getReceivers();
                                        senderList[0].track.enabled = false;
                                    }
                                    else {
                                        let senderList = my_peers[ele].getReceivers();
                                        senderList[0].track.enabled = true;
                                    }
                                }
                            }
                            function updateStateTrack(ele) {
                                // console.log(my_states);
                                if (my_state != PLAYER_STATE.ghost && my_states[ele].playerState == PLAYER_STATE.ghost) {
                                    let senderList = my_peers[ele].getReceivers();
                                    // console.log("ghost muted");
                                    senderList[0].track.enabled = false;
                                }
                            }

                            const array = new Uint8Array(analyser.frequencyBinCount);
                            analyser.getByteFrequencyData(array);
                            const arraySum = array.reduce((a, value) => a + value, 0);
                            const average = arraySum / array.length;
                            // console.log(Math.round(average));
                            if (Math.round(average) > 10){
                                // console.log(Math.round(average));
                                tmp_signaling_socket.emit('webRTC_speaking', {'bool': true, 'id': tmp_signaling_socket.id});
                            }
                            else {
                                tmp_signaling_socket.emit('webRTC_speaking', {'bool': false, 'id': tmp_signaling_socket.id});
                                setTimeout(function(){
                                    //do what you need here
                                }, 1000);
                            }
                            // console.log("my_pos is: " + Object.keys(this.my_pos).length);

                            if (Object.keys(this.my_pos).length >= 2 && tmp_signaling_socket.id in this.my_pos) {
                                // use the values of my_pos_x, my_pos_y, my_pos_x2, and my_pos_y2
                                my_x = this.my_pos[tmp_signaling_socket.id].x;
                                my_y = this.my_pos[tmp_signaling_socket.id].y;
                                my_state = this.playerStates[this.signaling_socket.id].playerState;
                
                                for (let ele in this.my_pos) {
                                    if (ele != tmp_signaling_socket.id) {
                                        updateProximityFlag(ele);
                                        updateStateTrack(ele);
                                    }
                                }
                            }
                            // setTimeout(1000);
                        };

                        let local_media = document.createElement('audio');

                        local_media.setAttribute("autoplay", "autoplay");

                        // local_media.setAttribute("muted", "true");
                        local_media.muted = true;
                        local_media.setAttribute("controls", "");
                        const audioContainer = document.getElementById('audio-container2');
                        audioContainer.appendChild(local_media);
                        this.attachMediaStream(local_media, stream);
                        if (callback) callback();
                    }
                    catch (error) {
                        // code that handles the error
                        console.error('An error occurred:', error.message);
                    }
                })
                .catch(() => {
                    console.log("Access denied for audio/video");
                    //alert("You chose not to provide access to the camera/microphone, demo will not work.");
                    console.log(errorback);
                    if (errorback) errorback();
                })
        }
        catch(error) {
            console.log("error " + error);
        }
    }

    mute() {
        if (this.mute_flag ) {
            this.local_media_stream.getAudioTracks()[0].enabled = false;
            //console.log('Microphone is off');
            this.mute_flag = false;
        } 
        else {
            this.local_media_stream.getAudioTracks()[0].enabled = true;
            //console.log('Microphone is on');
            this.mute_flag  = true;
        }
        return this.mute_flag 
    }

    move(playerObj) {
        if (!this.my_pos[playerObj.id]) {
            this.my_pos[playerObj.id] = {};
        }

        this.my_pos[playerObj.id].x = playerObj.x;
        this.my_pos[playerObj.id].y = playerObj.y;
    }

    updateState(players) {
        for (let playerId in players) {
            if (!this.playerStates[playerId]) {
                this.playerStates[playerId] = {};
            }
            this.playerStates[playerId].playerState = players[playerId].playerState;
        }
    }
    updateWallBetween(playerID, isWall) {
        if (!this.wallBetween[playerID]) {
            this.wallBetween[playerID] = {};
        }
        this.wallBetween[playerID] = isWall;
    }
}