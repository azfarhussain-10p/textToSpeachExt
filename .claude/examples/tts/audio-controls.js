// audio-controls.js - Comprehensive TTS Audio Controls for Browser Extensions

// Feature detection
if (!('speechSynthesis' in window)) {
  console.warn('SpeechSynthesis not supported. Use a polyfill or fallback.');
} else {
  const synth = window.speechSynthesis;
  let voices = [];
  let currentUtterance = null;
  let currentIndex = 0;
  let isPaused = false;
  let sentences = [];

  // Load voices (handle async in Chrome)
  function loadVoices() {
    voices = synth.getVoices();
    if (voices.length === 0) {
      synth.onvoiceschanged = () => {
        voices = synth.getVoices();
        populateVoiceSelect();
      };
    } else {
      populateVoiceSelect();
    }
  }

  // Populate voice dropdown
  function populateVoiceSelect() {
    const voiceSelect = document.getElementById('voices');
    if (voiceSelect) {
      voiceSelect.innerHTML = '';
      voices.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
      });
    }
  }

  // Split text into sentences
  function splitTextIntoSentences(text) {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }

  // Update progress
  function updateProgress() {
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('bar');
    if (progressText && progressBar) {
      progressText.textContent = `${currentIndex + 1}/${sentences.length}`;
      progressBar.style.width = `${(currentIndex / sentences.length) * 100}%`;
    }
  }

  // Highlight current sentence
  function highlightSentence(index) {
    document.querySelectorAll('.sentence').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
  }

  // Play function
  function playText(text, startIndex = 0) {
    sentences = splitTextIntoSentences(text);
    currentIndex = startIndex;
    speakNextSentence();
  }

  // Speak next sentence
  function speakNextSentence() {
    if (currentIndex >= sentences.length) {
      resetControls();
      return;
    }

    currentUtterance = new SpeechSynthesisUtterance(sentences[currentIndex]);
    const selectedVoice = document.getElementById('voices')?.value;
    if (selectedVoice) {
      currentUtterance.voice = voices.find(v => v.name === selectedVoice);
    }
    currentUtterance.rate = parseFloat(document.getElementById('rate')?.value || 1);
    currentUtterance.pitch = parseFloat(document.getElementById('pitch')?.value || 1);
    currentUtterance.volume = parseFloat(document.getElementById('volume')?.value || 1);

    currentUtterance.onend = () => {
      currentIndex++;
      updateProgress();
      speakNextSentence();
    };
    currentUtterance.onboundary = (event) => {
      if (event.name === 'sentence') {
        highlightSentence(currentIndex);
      }
    };
    currentUtterance.onerror = (event) => console.error('TTS Error:', event.error);

    synth.speak(currentUtterance);
    updateControls(true);
  }

  // Update button states
  function updateControls(speaking) {
    document.getElementById('play').disabled = speaking && !isPaused;
    document.getElementById('pause').disabled = !speaking || isPaused;
    document.getElementById('resume').disabled = !isPaused;
    document.getElementById('stop').disabled = !speaking;
  }

  // Reset controls
  function resetControls() {
    isPaused = false;
    currentUtterance = null;
    updateControls(false);
    highlightSentence(-1); // Clear highlight
    updateProgress();
  }

  // Event listeners
  document.addEventListener('DOMContentLoaded', () => {
    loadVoices();
    const text = document.querySelector('.text-block')?.textContent || '';
    const playBtn = document.getElementById('play');
    const pauseBtn = document.getElementById('pause');
    const resumeBtn = document.getElementById('resume');
    const stopBtn = document.getElementById('stop');
    const resetBtn = document.getElementById('reset');

    playBtn?.addEventListener('click', () => {
      if (isPaused) {
        synth.resume();
        isPaused = false;
      } else {
        playText(text, currentIndex);
      }
      updateControls(true);
    });

    pauseBtn?.addEventListener('click', () => {
      synth.pause();
      isPaused = true;
      updateControls(true);
    });

    resumeBtn?.addEventListener('click', () => {
      synth.resume();
      isPaused = false;
      updateControls(true);
    });

    stopBtn?.addEventListener('click', () => {
      synth.cancel();
      resetControls();
    });

    resetBtn?.addEventListener('click', () => {
      synth.cancel();
      currentIndex = 0;
      updateProgress();
      resetControls();
    });
  });
}