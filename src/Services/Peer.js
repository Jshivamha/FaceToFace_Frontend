// Services/Peer.js
class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:global.stun.twilio.com:3478',
            ],
          },
        ],
      });
    }
  }

  // Helpers
  onTrack(cb) {
    this.peer.ontrack = cb;
  }

  onIceCandidate(cb) {
    this.peer.onicecandidate = (e) => {
      if (e.candidate) cb(e.candidate);
    };
  }

  async addIceCandidate(candidate) {
    if (!candidate) return;
    try {
      await this.peer.addIceCandidate(candidate);
    } catch (err) {
      console.error('addIceCandidate error', err);
    }
  }

  /**
   * NOTE: Name kept for backward compatibility with your Room.jsx,
   * but this is actually setting the **remote** description.
   */
  async setLocalDescription(ans) {
    if (!this.peer) return;
    const desc =
      ans instanceof RTCSessionDescription ? ans : new RTCSessionDescription(ans);
    await this.peer.setRemoteDescription(desc);
  }

  async getAnswer(offer) {
    if (!this.peer) return null;

    const remoteDesc =
      offer instanceof RTCSessionDescription ? offer : new RTCSessionDescription(offer);

    await this.peer.setRemoteDescription(remoteDesc);
    const ans = await this.peer.createAnswer();
    await this.peer.setLocalDescription(ans);
    return this.peer.localDescription;
  }

  async getOffer() {
    if (!this.peer) return null;

    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    return this.peer.localDescription;
  }

  async restartIce() {
    try {
      await this.peer.restartIce?.();
    } catch (e) {
      console.error('restartIce failed', e);
    }
  }
}

export default new PeerService();
