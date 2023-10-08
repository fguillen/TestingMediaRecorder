let audioCtx;
let audioDestination;
let fullStream;
const videoElement = document.querySelector("#video-wrapper video");

function initFullStream() {
  fullStream = new MediaStream();

  // Add track for fullAudio
  // audioCtx = new AudioContext();
  // audioDestination = audioCtx.createMediaStreamDestination();
  // const fullAudioTrack = audioDestination.stream.getAudioTracks()[0];
  // fullStream.addTrack(fullAudioTrack);

  console.log("fullStream created");
}

async function connectMic() {
  const micStream =
    await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    });
  console.log("micStream.getAudioTracks().length: ", micStream.getAudioTracks().length);


  audioCtx = new AudioContext();
  const micSource = audioCtx.createMediaStreamSource(micStream);
  audioDestination = audioCtx.createMediaStreamDestination();
  micSource.connect(audioDestination);

  const fullAudioTrack = audioDestination.stream.getAudioTracks()[0];
  fullStream.addTrack(fullAudioTrack);

  // fullStream.addTrack(micStream.getAudioTracks()[0]);

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
  // Set up MediaRecorder
  const recordedChunks = [];
  const mediaRecorder = new MediaRecorder(fullStream, { mimeType: "video/webm;codecs=vp9" });
  mediaRecorder.ondataavailable = (event) => {
    console.log("MediaRecorder.ondataavailable(): ", event.data);
    recordedChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    console.log("MediaRecorder.onstop(): ", recordedChunks);
    const blob = new Blob(recordedChunks, { type: "video/webm;codecs=vp9" });
    console.log("MediaRecorder.onstop().blob: ", blob);

    playBlob(blob);
  };

  mediaRecorder.start();

  // Stop MediaRecorder after 10 seconds
  setTimeout(() => {
    mediaRecorder.stop();
  }, 10000);
}



document.querySelector("#start-recording-button").addEventListener("click", () => {
  record();
  document.querySelector("#start-recording-button").setAttribute("disabled", true);
});

document.querySelector("#connect-screen-button").addEventListener("click", () => {
  connectScreen();
  document.querySelector("#connect-screen-button").setAttribute("disabled", true);
});

document.querySelector("#connect-mic-button").addEventListener("click", () => {
  connectMic();
  document.querySelector("#connect-mic-button").setAttribute("disabled", true);
});


initFullStream();
playStream();
