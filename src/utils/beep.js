/**
 * Generate and play a beep sound using Web Audio API
 * Creates a classic pager-style beep tone
 */
export const playBeep = () => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator for the beep tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure beep sound (800Hz frequency, typical pager beep)
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    // Configure volume envelope (fade in/out for smoother sound)
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Quick fade in
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.15); // Hold
    gainNode.gain.linearRampToValueAtTime(0, now + 0.2);    // Fade out
    
    // Play the beep
    oscillator.start(now);
    oscillator.stop(now + 0.2);
    
    // Clean up
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
      audioContext.close();
    };
  } catch (error) {
    console.error('Failed to play beep sound:', error);
  }
};
