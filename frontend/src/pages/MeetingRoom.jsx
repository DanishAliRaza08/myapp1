import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Peer from 'simple-peer';

const Video = ({ peer }) => {
    const ref = useRef();
    useEffect(() => {
        peer.on('stream', stream => {
            if (ref.current) {
                ref.current.srcObject = stream;
            }
        });
    }, [peer]);
    return <video playsInline autoPlay ref={ref} className="w-full h-full object-cover rounded-lg shadow-lg" />;
};

const MeetingRoom = () => {
    const { meetingId } = useParams();
    const socket = useSocket();
    const [peers, setPeers] = useState([]);
    const userVideo = useRef();
    const peersRef = useRef([]);

    const createPeer = useCallback((userToSignal, callerID, stream) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peer.on('signal', sdp => {
            socket.emit('webrtc-offer', { sdp, offerTo: userToSignal, offerFrom: callerID });
        });
        return peer;
    }, [socket]);

    const addPeer = useCallback((incomingSignal, callerID, stream) => {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on('signal', sdp => {
            socket.emit('webrtc-answer', { sdp, answerTo: callerID, answerFrom: socket.id });
        });
        peer.signal(incomingSignal);
        return peer;
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

            socket.emit('join-meeting', meetingId);

            socket.on('user-joined', ({ usersInRoom }) => {
                const newPeers = [];
                usersInRoom.forEach(socketId => {
                    if (socketId === socket.id) return;
                    const peer = createPeer(socketId, socket.id, stream);
                    peersRef.current.push({
                        peerID: socketId,
                        peer,
                    });
                    newPeers.push({ peerID: socketId, peer });
                });
                setPeers(newPeers);
            });

            socket.on('webrtc-offer', ({ sdp, offerFrom }) => {
                const peer = addPeer(sdp, offerFrom, stream);
                peersRef.current.push({
                    peerID: offerFrom,
                    peer,
                });
                setPeers(currentPeers => [...currentPeers, { peerID: offerFrom, peer }]);
            });

            socket.on('webrtc-answer', ({ sdp, answerFrom }) => {
                const item = peersRef.current.find(p => p.peerID === answerFrom);
                if (item) {
                    item.peer.signal(sdp);
                }
            });

            socket.on('webrtc-ice-candidate', ({ candidate, sentFrom }) => {
                 const item = peersRef.current.find(p => p.peerID === sentFrom);
                 if (item) {
                    item.peer.signal({ candidate });
                 }
            });
        });

    }, [socket, meetingId, addPeer, createPeer]);

    return (
        <div className="p-4 h-screen bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Meeting Room: {meetingId}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border-2 border-blue-500 rounded-lg overflow-hidden">
                    <video ref={userVideo} muted autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                {peers.map(({ peerID, peer }) => (
                    <div key={peerID} className="border-2 border-gray-700 rounded-lg overflow-hidden">
                        <Video peer={peer} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MeetingRoom;