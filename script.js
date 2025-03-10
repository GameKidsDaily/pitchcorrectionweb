// Declare variables for audio processing
let audioContext, analyser, audioBuffer, audioSource;
let pitchShift = 0; // Pitch shift in cents
let canvas = document.getElementById('canvas');
let canvasContext = canvas.getContext('2d');

// File upload handler
function handleFileUpload(event) {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function(e) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.decodeAudioData(e.target.result, function(buffer) {
        audioBuffer = buffer;
        renderWaveform();
      });
    };
    reader.readAsArrayBuffer(file);
  }
}

// Render waveform for uploaded audio
function renderWaveform() {
  let data = audioBuffer.getChannelData(0); // Get the first channel data (mono)
  let width = canvas.width;
  let height = canvas.height;
  let step = Math.ceil(data.length / width);
  let amp = height / 2;

  canvasContext.fillStyle = 'lightgray';
  canvasContext.clearRect(0, 0, width, height);

  for (let i = 0; i < width; i++) {
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step; j++) {
      let datum = data[i * step + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    canvasContext.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
  }
}

// Start processing audio and pitch detection
function processAudio() {
  if (!audioBuffer) return;
  
  analyser = audioContext.createAnalyser();
  audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
  
  audioSource.start();
  
  analyser.fftSize = 2048;
  let bufferLength = analyser.frequencyBinCount;
  let dataArray = new Uint8Array(bufferLength);
  
  detectPitch(dataArray);
}

// Pitch Detection and Correction
function detectPitch(dataArray) {
  analyser.getByteFrequencyData(dataArray);

  // For simplicity, we'll just use a basic pitch detection logic for now
  // You could integrate Pitchy or other algorithms for better accuracy
  const maxFreq = Math.max(...dataArray);
  const detectedPitch = mapFreqToPitch(maxFreq);  // Mapping the max frequency to pitch
  
  // Apply pitch shift
  const shiftedPitch = applyPitchShift(detectedPitch);
  
  // Log pitch information for now
  console.log(`Detected Pitch: ${detectedPitch} Hz, Shifted Pitch: ${shiftedPitch} Hz`);

  // You could render a pitch graph here if desired (omitted for simplicity)
  requestAnimationFrame(() => detectPitch(dataArray));
}

// Convert frequency to pitch (simplified for now)
function mapFreqToPitch(frequency) {
  return 440 * Math.pow(2, (Math.log2(frequency / 440))); // Simplified A4 pitch mapping
}

// Apply pitch shift (in cents)
function applyPitchShift(frequency) {
  const cents = pitchShift;
  return frequency * Math.pow(2, cents / 1200); // Pitch shift formula
}

// Handle pitch shift slider changes
document.getElementById('pitchShift').addEventListener('input', function(event) {
  pitchShift = parseInt(event.target.value, 10);
  document.getElementById('pitchValue').textContent = pitchShift;
});

// Ensure the functions are attached to the HTML elements
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.querySelector('button').addEventListener('click', processAudio);
