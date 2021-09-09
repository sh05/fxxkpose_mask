const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const middleFingerPoints = new Set([10, 11, 12]);
const middleFingerPointsBottom = 10;
const width = 1280;
const height = 720;

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      if ( isFxxk(landmarks) ) {
        let x_min = Math.min(...landmarks.map((p) => p.x)) * width;
        let x_max = Math.max(...landmarks.map((p) => p.x)) * width;
        let y_min = Math.min(...landmarks.map((p) => p.y)) * height;
        let y_max = Math.max(...landmarks.map((p) => p.y)) * height;
        canvasCtx.fillStyle = "rgb(255, 0, 0)";
        canvasCtx.fillRect(x_min, y_min, x_max - x_min, y_max - y_min);
      }
    }
  }
  canvasCtx.restore();
}

function isFxxk(landmarks) {
  for (let i = 0; i < 21; i++) {
    if (!middleFingerPoints.has(i)) {
      if (landmarks[middleFingerPointsBottom].y > landmarks[i].y) {
        return false;
      }
    }
  }
  return true;
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 2,
  minDetectionConfidence: 0.85,
  minTrackingConfidence: 0.85
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: width,
  height: height, 
});

camera.start();
