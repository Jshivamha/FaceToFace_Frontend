import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useSocket } from '../Context/SocketProvider';
import peer from '../Services/Peer';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import VideoTile from '../components/VideoTile';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

const Room = () => {
  const socket = useSocket();
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setremoteStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // prevent adding the same tracks multiple times
  const tracksAddedRef = useRef(false);
  const addTracksOnce = useCallback((stream) => {
    if (tracksAddedRef.current || !stream) return;
    stream.getTracks().forEach((track) => peer.peer.addTrack(track, stream));
    tracksAddedRef.current = true;
  }, []);

  // ------------------ Call controls ------------------
  const toggleMic = () => {
    if (!myStream) return;
    const enabled = !audioEnabled;
    myStream.getAudioTracks().forEach((t) => (t.enabled = enabled));
    setAudioEnabled(enabled);
  };

  const toggleCam = () => {
    if (!myStream) return;
    const enabled = !videoEnabled;
    myStream.getVideoTracks().forEach((t) => (t.enabled = enabled));
    setVideoEnabled(enabled);
  };

  const leaveCall = () => {
    peer.peer.close();
    if (myStream) {
      myStream.getTracks().forEach((t) => t.stop());
    }
    toast('You left the call', { icon: '👋' });
    navigate('/');
  };

  // ------------------ Call flow ------------------
  const handleCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      addTracksOnce(stream);

      const offer = await peer.getOffer();
      socket.emit('user:call', { to: remoteSocketId, offer });
      toast('Calling…', { icon: '📞' });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access mic/camera');
    }
  }, [remoteSocketId, socket, addTracksOnce]);

  const handleUserJoined = useCallback(({ email, Email, id }) => {
    const userEmail = email || Email;
    console.log(`email: ${userEmail} joined the room`);
    setRemoteSocketId(id);
    toast.success(`${userEmail || 'Someone'} joined`);
  }, []);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
        addTracksOnce(stream);

        console.log('incoming call', from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', { to: from, ans });
        toast('Incoming call accepted', { icon: '✅' });
      } catch (error) {
        console.error('Error accessing media devices on incoming call:', error);
        toast.error('Could not access mic/camera');
      }
    },
    [socket, addTracksOnce]
  );

  const handleCallAccepted = useCallback(({ from, ans }) => {
    peer.setLocalDescription(ans); // actually sets remote description
    console.log('call accepted !');
    toast.success('Connected!');
  }, []);

  // ------------------ ICE candidate exchange ------------------
  useEffect(() => {
    peer.onIceCandidate((candidate) => {
      if (!remoteSocketId) return;
      socket.emit('peer:ice-candidate', { to: remoteSocketId, candidate });
    });

    const onCandidate = async ({ candidate }) => {
      await peer.addIceCandidate(candidate);
    };

    socket.on('peer:ice-candidate', onCandidate);
    return () => {
      socket.off('peer:ice-candidate', onCandidate);
    };
  }, [socket, remoteSocketId]);

  // ontrack -> set remote stream
  useEffect(() => {
    const handleTrack = (ev) => {
      const [stream] = ev.streams;
      setremoteStream(stream);
    };

    peer.peer.addEventListener('track', handleTrack);
    return () => {
      peer.peer.removeEventListener('track', handleTrack);
    };
  }, []);

  // Preview yourself on mount
  useEffect(() => {
    const initializeStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
      } catch (error) {
        console.error('Error accessing media devices on mount:', error);
      }
    };
    initializeStream();
  }, []);

  // listen to signaling events
  useEffect(() => {
    socket.on('user:joined', handleUserJoined);
    socket.on('incoming call', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);

    return () => {
      socket.off('user:joined', handleUserJoined);
      socket.off('incoming call', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  // Debug connection state
  useEffect(() => {
    const pc = peer.peer;
    const logState = () => {
      console.log('ice:', pc.iceConnectionState, '| conn:', pc.connectionState);
    };
    pc.addEventListener('iceconnectionstatechange', logState);
    pc.addEventListener('connectionstatechange', logState);
    return () => {
      pc.removeEventListener('iceconnectionstatechange', logState);
      pc.removeEventListener('connectionstatechange', logState);
    };
  }, []);

  const email = location.state?.Email;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <h1 className="text-lg font-medium tracking-wide">
              Room: <span className="text-gray-300 font-light">{roomId}</span>
            </h1>
          </div>
          <div className="text-sm text-gray-400 font-light">{email}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 h-full">
          {/* Local Video */}
          <AnimatePresence>
            {myStream && (
              <motion.div
                key="me"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col space-y-4"
              >
                <div className="relative">
                  <VideoTile stream={myStream} muted label="You" />
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-white">You</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Remote Video or Waiting State */}
          <AnimatePresence>
            {remoteStream ? (
              <motion.div
                key="remote"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col space-y-4"
              >
                <div className="relative">
                  <VideoTile stream={remoteStream} muted={false} label="Remote" />
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-white">Remote</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-medium mb-2 text-white">Waiting for connection</h3>
                <p className="text-gray-400 mb-8 max-w-sm">
                  {remoteSocketId 
                    ? "Ready to start the call when you're ready"
                    : "Waiting for someone to join the room..."
                  }
                </p>
                {remoteSocketId && (
                  <button
                    onClick={handleCallUser}
                    className="px-8 py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Start Call
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Controls */}
      <footer className="border-t border-gray-800 px-6 py-6">
        <div className="max-w-md mx-auto flex items-center justify-center gap-6">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${
              audioEnabled 
                ? 'bg-white text-black hover:bg-gray-100' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          
          <button
            onClick={toggleCam}
            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${
              videoEnabled 
                ? 'bg-white text-black hover:bg-gray-100' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          
          <button
            onClick={leaveCall}
            className="p-4 rounded-full bg-white text-black hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 shadow-lg"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Room;
