const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});
const socket = io('/')
// const videoGrid = document.getElementById('video-grid')
var recordedChunks = [];
const user = prompt("Enter your name");
const myPeer = new Peer(undefined, {})
// const myVideo = document.createElement('video')
myVideo.muted = true
let myVideoStream;
var options = { mimeType: "video/webm; codecs=vp8" };
var mediaRecorder;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)
    myVideoStream =  stream;
    mediaRecorder = new MediaRecorder(stream);
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
    socket.on('user-disconnected', userId => {
        console.log(userId)
    })
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, user)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
}


function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const recordingButton = document.querySelector("#recordMeeting");
var isRecording = false;

muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

recordingButton.addEventListener("click", () => {
  let recordingOptions = null;
  if (isRecording === false) {
    html = `<i class="fas fa-stop-circle"></i>`;
    mediaRecorder.start();
    console.log(mediaRecorder.state);
    console.log("recorder started");
    recordingButton.classList.toggle("background__red");
    recordingButton.innerHTML = html;
    isRecording = true;
  } else {
    html = `<i class="fas fa-circle"></i>`;
    mediaRecorder.stop();
    const clipName = prompt('Enter a name for your sound clip');
    recordingButton.classList.toggle("background__red");
    recordingButton.innerHTML = html;
      download(clipName);
      isRecording = false;
  }
});

function download(clipName) {
  var blob = new Blob(recordedChunks, {
    type: "video/webm"
  });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = `${clipName}.webm`;
  a.click();
  window.URL.revokeObjectURL(url);
}
// async function recordAudio() {
//   const mimeType = 'audio/webm';
//   shouldStop = false;
//   const stream = await navigator.mediaDevices.getUserMedia({audio: true});
//   handleRecord({stream, mimeType})
// }

// async function recordVideo() {
//   const mimeType = 'video/webm';
//   shouldStop = false;
//   const constraints = {
//     audio: true,
//     video: true,
//   };
//   const stream = await navigator.mediaDevices.getUserMedia(constraints);
//   handleRecord({stream, mimeType})
// }

// async function recordScreen() {
//   const mimeType = 'video/webm';
//   shouldStop = false;
//   const constraints = {
//     video: true
//   };
//   const displayStream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});
//   // voiceStream for recording voice with screen recording
//   const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
//   let tracks = [...displayStream.getTracks(), ...voiceStream.getAudioTracks()]
//   const stream = new MediaStream(tracks);
//   handleRecord({stream, mimeType})
// }
mediaRecorder.ondataavailable = function (e) {
  if (e.data.size > 0) {
    recordedChunks.push(e.data);
  }
}
  
// const handleRecord = function ({stream, mimeType}) {
//   // to store collect stream chunks
//   let recordedChunks = [];
//   stopped = false;
//   const mediaRecorder = new MediaRecorder(stream);

//   mediaRecorder.ondataavailable = function (e) {
//     if (e.data.size > 0) {
//       recordedChunks.push(e.data);
//     }
//     // shouldStop => forceStop by user
//     if (shouldStop === true && stopped === false) {
//       mediaRecorder.stop();
//       stopped = true;
//     }
//   };
//   mediaRecorder.onstop = function () {
//     const blob = new Blob(recordedChunks, {
//       type: mimeType
//     });
//     recordedChunks = []
//     const filename = window.prompt('Enter file name'); // input filename from user for download
//     downloadLink.href = URL.createObjectURL(blob); // create download link for the file
//     downloadLink.download = `${filename}.webm`; // naming the file with user provided name
//     stopRecord();
//   };

//   mediaRecorder.start(200); // here 200ms is interval of chunk collection
// };

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});

function onMediaSuccess(stream) {
  var mediaRecorder = new MediaStreamRecorder(stream);
  mediaRecorder.mimeType = 'video/webm';
  mediaRecorder.ondataavailable = function (blob) {
      // POST/PUT "Blob" using FormData/XHR2
      var blobURL = URL.createObjectURL(blob);
      document.write('<a href="' + blobURL + '">' + blobURL + '</a>');
  };
  mediaRecorder.start(3000);
}

