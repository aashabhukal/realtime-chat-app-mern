import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { SocketContext } from './SocketContext';
import { AuthContext } from './AuthContext';

export const CallContext = createContext();
export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
  const { socket } = useContext(SocketContext) || {};
  const { user } = useContext(AuthContext);
  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const pc = useRef(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerIdRef = useRef(null);

  const createPC = (peerId) => {
    pc.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.current.ontrack = (e) => { if (remoteVideo.current) remoteVideo.current.srcObject = e.streams[0]; };
    pc.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit('call:ice-candidate', { to: peerId, candidate: e.candidate });
    };
    return pc.current;
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('call:offer', async ({ from, offer }) => {
      peerIdRef.current = from;
      setIncomingCall({ from, offer });
    });

    socket.on('call:answer', async ({ answer }) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('call:ice-candidate', async ({ candidate }) => {
      try { await pc.current?.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    });

    socket.on('call:end', () => endCall());

    return () => {
      socket.off('call:offer');
      socket.off('call:answer');
      socket.off('call:ice-candidate');
      socket.off('call:end');
    };
  }, [socket]);

  const startCall = async (otherUserId, isVideo = true) => {
    peerIdRef.current = otherUserId;
    const _pc = createPC(otherUserId);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
    stream.getTracks().forEach(t => _pc.addTrack(t, stream));
    if (localVideo.current) localVideo.current.srcObject = stream;

    const offer = await _pc.createOffer();
    await _pc.setLocalDescription(offer);
    socket.emit('call:offer', { to: otherUserId, offer });
    setInCall(true);
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    const { from, offer } = incomingCall;
    const _pc = createPC(from);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach(t => _pc.addTrack(t, stream));
    if (localVideo.current) localVideo.current.srcObject = stream;

    await _pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await _pc.createAnswer();
    await _pc.setLocalDescription(answer);
    socket.emit('call:answer', { to: from, answer });
    setIncomingCall(null);
    setInCall(true);
  };

  const endCall = () => {
    if (peerIdRef.current) socket?.emit('call:end', { to: peerIdRef.current });
    pc.current?.close();
    pc.current = null;
    setInCall(false);
    setIncomingCall(null);
    peerIdRef.current = null;
  };

  return (
    <CallContext.Provider value={{ incomingCall, inCall, startCall, acceptCall, endCall, localVideo, remoteVideo }}>
      {children}
      {inCall && (
        <div className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-4">
            <video ref={localVideo} autoPlay muted playsInline className="w-40 h-32 bg-gray-800 rounded" />
            <video ref={remoteVideo} autoPlay playsInline className="w-80 h-60 bg-gray-800 rounded" />
          </div>
          <button onClick={endCall} className="bg-red-500 text-white px-6 py-2 rounded-full">Cut</button>
        </div>
      )}
      {incomingCall &&!inCall && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
          <p className="text-sm mb-2">Incoming call...</p>
          <div className="flex gap-2">
            <button onClick={acceptCall} className="bg-green-500 text-white px-4 py-1 rounded">Accept</button>
            <button onClick={() => setIncomingCall(null)} className="bg-red-500 text-white px-4 py-1 rounded">Reject</button>
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
};