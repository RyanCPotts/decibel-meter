import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [decibel, setDecibel] = useState(0);
  const [audioContext, setAudioContext] = useState(null);
  const [analyzer, setAnalyzer] = useState(null);

  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaStreamSource(stream);
      const analyzerNode = context.createAnalyser();
      
      analyzerNode.fftSize = 1024;
      analyzerNode.smoothingTimeConstant = 0.8;
      source.connect(analyzerNode);

      setAudioContext(context);
      setAnalyzer(analyzerNode);
      setIsListening(true);

      const dataArray = new Uint8Array(analyzerNode.frequencyBinCount);
      
      const updateLevel = () => {
        if (!isListening) return;
        
        analyzerNode.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        
        // Convert to decibels (approximate)
        const db = Math.round(average);
        setDecibel(db);
        
        requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Please allow microphone access to use this app');
    }
  };

  const stopListening = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setAnalyzer(null);
    }
    setIsListening(false);
  };

  return (
    <div className="App">
      <div className="meter-container">
        <div className="decibel-display">
          <span className="decibel-value">{decibel}</span>
          <span className="decibel-unit">dB</span>
        </div>
        <button 
          className={`control-button ${isListening ? 'stop' : 'start'}`}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? 'Stop' : 'Start'} Monitoring
        </button>
      </div>
    </div>
  );
}

export default App;