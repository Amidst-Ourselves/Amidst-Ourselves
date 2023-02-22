const SIGNALING_SERVER = "http://localhost:3000";
const USE_AUDIO = true;
const USE_VIDEO = false;
const DEFAULT_CHANNEL = 'tmp';
const MUTE_AUDIO_BY_DEFAULT = false;
const ICE_SERVERS = [
    {urls:"stun:stun.l.google.com:19302"}
];


// Please note: the webRTC implementation borrowed a lot ideas code from:
// https://github.com/anoek/webrtc-group-chat-example
class webRTCClientManager {

    constructor() {}

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
            // this.stream_recycle = {};
        }
        catch(error) {
            console.log("error " + error);
        }
    }

    create() {
        console.log("Connecting to signaling server");
        try{
            // Connect to the signaling server
            this.signaling_socket.on('connect', () => {
                console.log("Connected to signaling server");
                // Obtain user's audio from mic and wrap it as a continuous stream
                // joinChatRoom(this.signaling_socket, this.roomCode);
                this.setUpMedia(() => {
                    // join the char room that has same roomCode as the game room
                    joinChatRoom(this.signaling_socket, this.roomCode);
                });
            });
        }
        catch(error) {
            console.log("error " + error);
        }

        try{
            // Disconnect signal, I don't think I have ever used this part
            this.signaling_socket.on('webRTC_disconnect', () => {
                console.log("Disconnected from signaling server");

                for (peer_id in this.peer_media_elements) {
                    this.peer_media_elements[peer_id].remove();
                }
                for (peer_id in this.peers) {
                    this.peers[peer_id].close();
                }

                this.peers = {};
                this.peer_media_elements = {};
            });
        }
        catch(error) {
            console.log("error " + error);
        }

        function joinChatRoom(signaling_socket, roomCode) {
            console.log("send join chat channel request");
            try {
                signaling_socket.emit('webRTC_join', {roomCode});
            }
            catch (error) {
                // code that handles the error
                console.error('An error occurred:', error.message);
            }
        }
        

        // Haven't use this function so far, but could use it in the future. At this stage I don't know what is the
        // consequence of leaving a bunch of open channel
        function deleteChannel(channel) {
            this.signaling_socket.emit('webRTC_delete', channel);
        }

        // try{
        //     // Create peer-2-peer connection if a new user enter the room
        //     this.signaling_socket.on('addPeer', (config) => {
        //         console.log('Signaling server said to add peer:', config);
        //         let peer_id = config.peer_id;
        //         let peer_socket = config.peer_socket;
        //         if (peer_id in this.peers) {
        //             console.log("Already connected to peer ", peer_id);
        //             return;
        //         }
        //         var peer_connection = new RTCPeerConnection(
        //             {"iceServers": ICE_SERVERS},
        //             {"optional": [{"DtlsSrtpKeyAgreement": true}]}
        //         );
        //         this.peers[peer_id] = peer_connection;
        //         console.log("new peer")

        //         peer_connection.onicecandidate = (event) => {
        //             if (event.candidate) {
        //                 this.signaling_socket.emit('relayICECandidate', {
        //                     'peer_id': peer_id, 
        //                     'ice_candidate': {
        //                         'sdpMLineIndex': event.candidate.sdpMLineIndex,
        //                         'candidate': event.candidate.candidate
        //                     }, 
        //                     'roomCode': this.roomCode
        //                 });
        //             }
        //         }

        //         peer_connection.ontrack = (event) => {

        //             console.log("ontrack", event);

        //             try {
        //                 var remote_media = document.createElement('audio');

        //                 remote_media.setAttribute("autoplay", "autoplay");
        //                 if (MUTE_AUDIO_BY_DEFAULT) {
        //                     remote_media.setAttribute("muted", "true");
        //                 }
        //                 remote_media.setAttribute("controls", "");
        //                 this.peer_media_elements[peer_id] = remote_media;
        //                 const audioContainer = document.getElementById('audio-container');
        //                 audioContainer.appendChild(remote_media);
        //                 this.attachMediaStream(remote_media, event.streams[0]);

        //                 let player_id = 0;
        //                 let proximity_flag = true;
        //                 this.signaling_socket.on('proximity', (playerObj) => {
        //                     player_id = playerObj.id,
        //                     proximity_flag = playerObj.bool
        //                 });
        //                 const volume = remote_media.volume;
        //                 console.log('proximity_flag is: ' + proximity_flag)
        //                 if (proximity_flag) {
        //                     remote_media.volume = 1.0;
        //                 } else {
        //                     remote_media.volume = 0.0;
        //                 }
                      
        //                 // Use setTimeout to repeatedly check the distance
        //                 // setTimeout(1000);
        //             }
        //             catch (error) {
        //                 // code that handles the error
        //                 console.error('An error occurred:', error.message);
        //             }
        //         }

        //         // add local stream
        //         // TODO: replace deprecated function with newest ones
        //         peer_connection.addStream(this.local_media_stream);
        //         if (config.should_create_offer) {
        //             try {
        //                 console.log("Creating RTC offer to ", peer_id);
        //                 // SDP (Session Description Protocol) is the standard describing a 
        //                 // peer-to-peer connection. SDP contains the codec, source address, 
        //                 // and timing information of audio and video.
        //                 peer_connection.createOffer(
        //                     (session_description) => { 
        //                         console.log("Session description is: ", session_description);
        //                         // The RTCPeerConnection method setLocalDescription() changes the local description 
        //                         // associated with the connection. This description specifies the properties of the local 
        //                         // end of the connection, including the media format. The method takes a single parameter—the 
        //                         // session description—and it returns a Promise which is fulfilled once the description has 
        //                         // been changed, asynchronously.
        //                         // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription
        //                         peer_connection.setLocalDescription(session_description,
        //                             () => { 
        //                                 this.signaling_socket.emit('relaySessionDescription', 
        //                                     {'peer_id': peer_id, 'session_description': session_description, 'roomCode': this.roomCode});
        //                                 console.log("Offer setLocalDescription succeeded"); 
        //                             },
        //                             () => { Alert("Offer setLocalDescription failed!"); }
        //                         );
        //                     },
        //                     (error) => {
        //                         console.log("Error sending offer: ", error);
        //                     });
        //             }
        //             catch (error) {
        //                 // code that handles the error
        //                 console.error('An error occurred:', error.message);
        //             }
        //         }
        //     });
        // }
        // catch(error) {
        //     console.log("error " + error);
        // }


        try {
            // this listener is for remote/peer session_description
            this.signaling_socket.on('sessionDescription', (config) => {
                
                console.log('Remote description received: ', config);
                try {
                    let peer_id = config.peer_id;
                    let peer = this.peers[peer_id];
                    let remote_description = config.session_description;
                    console.log(config.session_description);

                    let desc = new RTCSessionDescription(remote_description);
                    peer.setRemoteDescription(desc, 
                        () => {
                            console.log("setRemoteDescription succeeded");
                            if (remote_description.type == "offer") {
                                console.log("Creating answer");
                                peer.createAnswer(
                                    (session_description) => {
                                        console.log("Answer description is: ", session_description);
                                        peer.setLocalDescription(session_description,
                                            () => { 
                                                this.signaling_socket.emit('relaySessionDescription', 
                                                    {'peer_id': peer_id, 'session_description': session_description, 'roomCode': this.roomCode});
                                                console.log("Answer setLocalDescription succeeded");
                                            },
                                            () => { Alert("Answer setLocalDescription failed!"); }
                                        );
                                    },
                                    (error) => {
                                        console.log("Error creating answer: ", error);
                                        console.log(peer);
                                    });
                            }
                        },
                        (error) => {
                            console.log("setRemoteDescription error: ", error);
                        }
                    );
                }
                catch (error) {
                    // code that handles the error
                    console.error('An error occurred:', error.message);
                }

            });
        }
        catch(error) {
            console.log("error " + error);
        }

        try {
            // https://developer.mozilla.org/en-US/docs/Glossary/ICE
            this.signaling_socket.on('iceCandidate', (config) => {
                let peer = this.peers[config.peer_id];
                let ice_candidate = config.ice_candidate;
                peer.addIceCandidate(new RTCIceCandidate(ice_candidate));
            });
        }
        catch(error) {
            console.log("error " + error);
        }

        try {
            this.signaling_socket.on('removePeer', (config) => {
                console.log('Signaling server said to remove peer:', config);
                let peer_id = config.peer_id;
                if (peer_id in this.peer_media_elements) {
                    this.peer_media_elements[peer_id].remove();
                }
                if (peer_id in this.peers) {
                    this.peers[peer_id].close();
                }
                console.log("deleting peer")
                delete this.peers[peer_id];
                delete this.peer_media_elements[config.peer_id];
            });
        }
        catch(error) {
            console.log("error " + error);
        }
    }


    // add remote audio and 
    update(players) {

        let proximity_flag = true;
        let global_peer_id = 0
        // let remote_media = document.createElement('audio');
        let global_signaling_socket = this.signaling_socket;
        let global_peers = this.peers;


        this.signaling_socket.on('leave', (playerObj) => {
            this.signaling_socket.emit('webRTC_disconnect');
        });
        
        try{
            // Create peer-2-peer connection if a new user enter the room
            this.signaling_socket.on('addPeer', (config) => {
                console.log('Signaling server said to add peer:', config);
                let peer_id = config.peer_id;
                if (config.should_create_offer){
                    global_peer_id = peer_id;
                }
                let peer_socket = config.peer_socket;
                if (peer_id in this.peers) {
                    console.log("Already connected to peer ", peer_id);
                    return;
                }
                var peer_connection = new RTCPeerConnection(
                    {"iceServers": ICE_SERVERS},
                    {"optional": [{"DtlsSrtpKeyAgreement": true}]}
                );
                this.peers[peer_id] = peer_connection;
                console.log("new peer")

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

                    console.log("ontrack", event);

                    try {
                        var remote_media = document.createElement('audio');

                        remote_media.setAttribute("autoplay", "autoplay");
                        // remote_media.autoplay = true;
                        // remote_media.muted = true;
                        if (MUTE_AUDIO_BY_DEFAULT) {
                            // remote_media.setAttribute("muted", "true");
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
                // for (const track of this.local_media_stream.getTracks()) {
                //     peer_connection.addTrack(track, this.local_media_stream);
                // }


                if (config.should_create_offer) {
                    try {
                        console.log("Creating RTC offer to ", peer_id);
                        // SDP (Session Description Protocol) is the standard describing a 
                        // peer-to-peer connection. SDP contains the codec, source address, 
                        // and timing information of audio and video.
                        peer_connection.createOffer(
                            (session_description) => { 
                                console.log("Session description is: ", session_description);
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
                                        console.log("Offer setLocalDescription succeeded"); 
                                    },
                                    () => { Alert("Offer setLocalDescription failed!"); }
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

        // let my_pos = {};
        // let my_x = null;
        // let my_y = null;
        let tmp_pos = this.my_pos;
        this.signaling_socket.on('my_pos2', (config) => {
            tmp_pos[config.id] = [config.x, config.y]
        });


        const toggleMicrophoneButton = document.getElementById('toggle-microphone');
        let isMicrophoneOn = true;
        
        toggleMicrophoneButton.addEventListener('click', () => {
            console.log("isMicrophoneOn: "+ isMicrophoneOn)
          if (isMicrophoneOn) {
            // Turn off the microphone
            // navigator.mediaDevices.getUserMedia({audio: true})
            //   .then(stream => {
                this.local_media_stream.getAudioTracks()[0].enabled = false;
                isMicrophoneOn = false;
                toggleMicrophoneButton.innerText = 'Turn On Microphone';
            //   })
            //   .catch(error => console.error(error));
          } 
          else {
            // console.log("clicked")
            // Turn on the microphone
            // navigator.mediaDevices.getUserMedia({audio: true})
            //   .then(stream => {
                this.local_media_stream.getAudioTracks()[0].enabled = true;
                isMicrophoneOn = true;
                toggleMicrophoneButton.innerText = 'Turn Off Microphone';
            //   })
            //   .catch(error => console.error(error));
          }
          setTimeout(function(){
            //do what you need here
        }, 1000);
        });
    }

    


    attachMediaStream(element, stream) {
        console.log('DEPRECATED, attachMediaStream will soon be removed.');
        element.srcObject = stream;
    };

    setUpMedia(callback, errorback) {
        try {
            if (this.local_media_stream != null) {
                if (callback) callback();
                return; 
            }

            console.log("Requesting access to local audio / video inputs");


            navigator.getUserMedia = ( navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia);

            this.attachMediaStream = (element, stream) => {
                console.log('DEPRECATED, attachMediaStream will soon be removed.');
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
                        let my_peers = this.peers
                        let my_stream = this.local_media_stream;
                        scriptProcessor.onaudioprocess = function() {

                            function m_distance(x1,y1,x2,y2) {
                                return Math.abs(x1 - x2) + Math.abs(y1 - y2);
                            }
                        
                            function updateProximityFlag(ele) {
                                // console.log(ele);
                                if (m_distance(my_x, my_y, my_pos[ele][0], my_pos[ele][1]) > 150) {
                                    // console.log("I'm in proximity")
                                    let senderList = my_peers[ele].getSenders();
                                    // console.log("length is: " + Object.keys(senderList).length);
                                    // senderList.forEach((sender) => {
                                    //     sender.track.enabled = false;
                                    // });
                                    senderList[0].track.enabled = false;
                                }
                                else {

                                    let senderList = my_peers[ele].getSenders();
                                    // console.log("length is: " + Object.keys(senderList).length);
                                    // senderList.forEach((sender) => {
                                    //     sender.track.enabled = true;
                                    // });
                                    senderList[0].track.enabled = true;
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
                            }

                            if (Object.keys(my_pos).length >= 2 && tmp_signaling_socket.id in my_pos) {
                                // use the values of my_pos_x, my_pos_y, my_pos_x2, and my_pos_y2
                                my_x = my_pos[tmp_signaling_socket.id][0];
                                my_y = my_pos[tmp_signaling_socket.id][1];
                
                                for (let ele in my_pos) {
                                    if (ele != tmp_signaling_socket.id) {
                                        updateProximityFlag(ele);
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
                    alert("You chose not to provide access to the camera/microphone, demo will not work.");
                    console.log(errorback);
                    if (errorback) errorback();
                })
        }
        catch(error) {
            console.log("error " + error);
        }
    }
}