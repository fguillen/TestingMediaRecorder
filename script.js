let audioCtx;
let audioDestination;
let fullStream;
let isRecording = false;
const videoElement = document.querySelector("#video-wrapper video");

function initFullStream() {
  fullStream = new MediaStream();

  // Add track for fullAudio
  audioCtx = new AudioContext();
  audioDestination = audioCtx.createMediaStreamDestination();
  const fullAudioTrack = audioDestination.stream.getAudioTracks()[0];
  fullStream.addTrack(fullAudioTrack);

  // Adding a silent audioTrack to overpass chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=1490888
  // from: https://stackoverflow.com/a/68644274/316700
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 0;
  oscillator.connect(gainNode);
  gainNode.connect(audioDestination);

  console.log("fullStream created");
}

async function connectMic() {
  const micStream =
    await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    });
  console.log("micStream.getAudioTracks().length: ", micStream.getAudioTracks().length);

  const micSource = audioCtx.createMediaStreamSource(micStream);
  micSource.connect(audioDestination);

  console.log("Mic connected");
}

async function connectScreen() {
  // Getting screenStream
  const screenStream =
    await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });

  // Screen Stream
  console.log("screenStream.getVideoTracks()[0]: ", screenStream.getVideoTracks()[0]);
  fullStream.addTrack(screenStream.getVideoTracks()[0]);
}

function playStream() {
  videoElement.srcObject = fullStream;
  // videoElement.muted = false;
  videoElement.play();
}

function playBlob(blob) {
  const videoURL = window.URL.createObjectURL(blob);
  videoElement.pause();
  videoElement.srcObject = null;
  videoElement.src = videoURL;
  videoElement.muted = false;
  videoElement.play();
}

function record() {
  console.log("Start recording");
  isRecording = true;

  // Set up MediaRecorder
  const recordedChunks = [];
  const mediaRecorder = new MediaRecorder(fullStream, { mimeType: "video/webm" });
  mediaRecorder.ondataavailable = (event) => {
    console.log("MediaRecorder.ondataavailable(): ", event.data);
    recordedChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    console.log("MediaRecorder.onstop(): ", recordedChunks);
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    console.log("MediaRecorder.onstop().blob: ", blob);

    playBlob(blob);
  };

  mediaRecorder.start();

  // Stop MediaRecorder after 10 seconds
  setTimeout(() => {
    mediaRecorder.stop();
  }, 10000);
}

document.querySelector("#init-full-stream-button").addEventListener("click", () => {
  initFullStream();
  playStream();
  document.querySelector("#init-full-stream-button").setAttribute("disabled", true);
  document.querySelector("#connect-screen-button").removeAttribute("disabled");
  document.querySelector("#connect-mic-button").removeAttribute("disabled");
});


document.querySelector("#start-recording-button").addEventListener("click", () => {
  record();
  document.querySelector("#start-recording-button").setAttribute("disabled", true);
  document.querySelector("#connect-screen-button").setAttribute("disabled", true);
});

document.querySelector("#connect-screen-button").addEventListener("click", () => {
  connectScreen();
  document.querySelector("#start-recording-button").removeAttribute("disabled");
  document.querySelector("#connect-screen-button").setAttribute("disabled", true);
});

document.querySelector("#connect-mic-button").addEventListener("click", () => {
  connectMic();
  if (!isRecording) {
    document.querySelector("#start-recording-button").removeAttribute("disabled");
  }
  document.querySelector("#connect-mic-button").setAttribute("disabled", true);
});
