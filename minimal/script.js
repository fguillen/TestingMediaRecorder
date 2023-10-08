const videoElement = document.querySelector("#video-wrapper video");

async function record() {
  const fullStream = new MediaStream();

  // Add track for fullAudio
  const audioCtx = new AudioContext();
  const audioDestination = audioCtx.createMediaStreamDestination();
  const fullAudioTrack = audioDestination.stream.getAudioTracks()[0];
  fullStream.addTrack(fullAudioTrack);

  // Getting screenStream
  const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  fullStream.addTrack(screenStream.getVideoTracks()[0]);

  // Getting micStream
  const micStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
  const micSource = audioCtx.createMediaStreamSource(micStream);
  // micSource.connect(audioDestination); // If I un-comment this line, the recording is made properly. But this connection has to be made after

  // from: https://stackoverflow.com/a/68644274/316700
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 0;
  oscillator.connect(gainNode);
  gainNode.connect(audioDestination);

  // Play realtime stream
  videoElement.srcObject = fullStream;
  videoElement.play();

  // Set up MediaRecorder
  const recordedChunks = [];
  const mediaRecorder = new MediaRecorder(fullStream, { mimeType: "video/webm" });
  mediaRecorder.ondataavailable = (event) => {
    recordedChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });

    // Play recorded blob
    playBlob(blob);
  };

  mediaRecorder.start();

  // Stop MediaRecorder after 10 seconds
  setTimeout(() => {
    mediaRecorder.stop();
  }, 10000);
}

function playBlob(blob) {
  const videoURL = window.URL.createObjectURL(blob);
  videoElement.pause();
  videoElement.srcObject = null;
  videoElement.src = videoURL;
  videoElement.muted = false;
  videoElement.play();
}

document.querySelector("#record-button").addEventListener("click", () => {
  record();
  document.querySelector("#record-button").setAttribute("disabled", true);
});
