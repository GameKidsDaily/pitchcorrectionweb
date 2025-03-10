// script.js
let audioContext;
let analyser;
let microphone;
let pitchShift = 0; // Pitch shift in cents

// Initialize Web Audio API
function startMic() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      
      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      
      // Start pitch detection
      detectPitch();
    }).catch(err => {
      alert('Microphone access denied!');
    });
  } else {
    alert('Your browser does not support audio input.');
  }
}

// Pitch detection function using analyser node
function detectPitch() {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  analyser.getByteFrequencyData(dataArray);
  
  // Estimate the pitch using pitch detection algorithms (or a library)
  const pitch = estimatePitch(dataArray);  // Simplified, can be replaced with a real algorithm
  
  if (pitch !== null) {
    applyPitchShift(pitch);
  }
  
  requestAnimationFrame(detectPitch);
}

// Apply pitch shift using an audio buffer source (simplified)
function applyPitchShift(pitch) {
  const cents = pitchShift;
  const frequency = pitch * Math.pow(2, cents / 1200); // Pitch shift formula

  // Apply pitch shifting logic (in this case, it's simplified)
  // You could use an actual pitch shifting effect here to manipulate the sound
  
  console.log(`Detected pitch: ${pitch} Hz, shifted by ${cents} cents to ${frequency} Hz`);
}

// Adjust pitch shift from range slider
document.getElementById('pitchShift').addEventListener('input', function (event) {
  pitchShift = parseInt(event.target.value, 10);
  document.getElementById('pitchValue').textContent = pitchShift;
});

// Simple pitch detection logic (can be replaced with a better algorithm)
function estimatePitch(frequencyData) {
  // Example logic for estimating pitch (placeholder)
  // Use frequency data from analyser to estimate the pitch
  const maxFreq = Math.max(...frequencyData);
  const pitch = maxFreq; // This is simplified; real pitch detection would be more complex
  return pitch;
}
