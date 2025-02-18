import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [decibel, setDecibel] = useState(0);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const streamRef = useRef(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaStreamSource(stream);
      const analyzerNode = context.createAnalyser();

      analyzerNode.fftSize = 512;
      analyzerNode.smoothingTimeConstant = 0.8;
      source.connect(analyzerNode);

      audioContextRef.current = context;
      analyzerRef.current = analyzerNode;
      streamRef.current = stream;
      isListeningRef.current = true;
      setIsListening(true);

      updateLevel();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Please allow microphone access to use this app');
    }
  };

  const updateLevel = () => {
    if (!isListeningRef.current || !analyzerRef.current) return;

    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;

    const db = Math.round(average);
    setDecibel(db);

    requestAnimationFrame(updateLevel);
  };

  const stopListening = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    analyzerRef.current = null;
    isListeningRef.current = false;
    setIsListening(false);
  };

  const getDecibelClass = () => {
    if (decibel < 30) return "decibel-low";
    if (decibel < 70) return "decibel-medium";
    return "decibel-high";
  };

  return (
    <div className="App">
      <div className="meter-container">
        <div className="decibel-display">
          <span className={`decibel-value ${getDecibelClass()}`}>{decibel}</span>
          <span className="decibel-unit">dB</span>
        </div>

        {/* Decibel Bar Visualization */}
        <div className="decibel-bar">
          <div 
            className="decibel-bar-fill"
            style={{ 
              width: `${Math.min(decibel, 100)}%`, 
              backgroundColor: decibel < 30 ? '#4ade80' : decibel < 70 ? '#facc15' : '#ef4444' 
            }} 
          />
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
