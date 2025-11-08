/**
 * Fax Renderer Utility
 * Renders messages as vintage fax document images using Canvas API
 */

/**
 * Generate a paper texture pattern
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
const applyPaperTexture = (ctx, width, height) => {
  // Create a subtle paper texture with beige/cream color
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f4f1e8');
  gradient.addColorStop(0.5, '#f8f6f0');
  gradient.addColorStop(1, '#f4f1e8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle noise for paper texture (optimized with sampling)
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Sample every 4th pixel for better performance
  for (let i = 0; i < data.length; i += 16) {
    const noise = (Math.random() - 0.5) * 15;
    data[i] += noise;     // R
    data[i + 1] += noise; // G
    data[i + 2] += noise; // B
  }
  
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Render fax header with timestamp and sender info
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} timestamp - Message timestamp
 * @param {string} sender - Sender identifier
 */
const renderFaxHeader = (ctx, width, timestamp, sender = 'Unknown') => {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  });
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 14px "Courier New", monospace';
  
  // Header border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, 60);
  
  // Header text
  ctx.fillText('FAX TRANSMISSION', 30, 45);
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText(`DATE: ${dateStr}`, 30, 65);
  ctx.fillText(`TIME: ${timeStr}`, width / 2, 65);
};

/**
 * Wrap and render message text
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Message text
 * @param {number} x - Starting x position
 * @param {number} y - Starting y position
 * @param {number} maxWidth - Maximum line width
 * @param {number} lineHeight - Line height
 * @returns {number} Final y position after rendering
 */
const renderWrappedText = (ctx, text, x, y, maxWidth, lineHeight) => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  ctx.fillStyle = '#000000';
  ctx.font = '14px "Courier New", monospace';

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  
  return currentY + lineHeight;
};

/**
 * Render a fax document from a message
 * @param {import('../types/index.js').Message} message - Message to render
 * @param {number} width - Canvas width (default: 595)
 * @param {number} height - Canvas height (default: 842)
 * @returns {Promise<string>} Data URL of rendered fax image
 */
export const renderFaxDocument = async (message, width = 595, height = 842) => {
  return new Promise((resolve) => {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Apply paper texture background
    applyPaperTexture(ctx, width, height);

    // Render fax header
    renderFaxHeader(ctx, width, message.timestamp, message.sender);

    // Render message content
    const contentY = 120;
    const margin = 40;
    const maxWidth = width - (margin * 2);
    const lineHeight = 22;

    renderWrappedText(
      ctx,
      message.content,
      margin,
      contentY,
      maxWidth,
      lineHeight
    );

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    resolve(dataUrl);
  });
};

/**
 * Apply visual effects to fax rendering (scan lines, distortion, noise)
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export const applyFaxEffects = (canvas, ctx) => {
  const width = canvas.width;
  const height = canvas.height;

  // Apply scan lines (optimized - every 3rd line)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Apply noise/grain overlay (optimized with sampling)
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Sample every 4th pixel for better performance
  for (let i = 0; i < data.length; i += 16) {
    const noise = (Math.random() - 0.5) * 20;
    data[i] += noise;     // R
    data[i + 1] += noise; // G
    data[i + 2] += noise; // B
  }
  
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Render fax document with visual effects
 * @param {import('../types/index.js').Message} message - Message to render
 * @param {number} width - Canvas width (default: 595)
 * @param {number} height - Canvas height (default: 842)
 * @returns {Promise<string>} Data URL of rendered fax image with effects
 */
export const renderFaxDocumentWithEffects = async (message, width = 595, height = 842) => {
  return new Promise((resolve) => {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Apply paper texture background
    applyPaperTexture(ctx, width, height);

    // Render fax header
    renderFaxHeader(ctx, width, message.timestamp, message.sender);

    // Render message content
    const contentY = 120;
    const margin = 40;
    const maxWidth = width - (margin * 2);
    const lineHeight = 22;

    renderWrappedText(
      ctx,
      message.content,
      margin,
      contentY,
      maxWidth,
      lineHeight
    );

    // Apply visual effects
    applyFaxEffects(canvas, ctx);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    resolve(dataUrl);
  });
};

/**
 * Render fax document with progressive animation
 * @param {import('../types/index.js').Message} message - Message to render
 * @param {HTMLCanvasElement} targetCanvas - Target canvas element to render to
 * @param {Function} onProgress - Callback for animation progress (0-1)
 * @param {number} duration - Animation duration in milliseconds (default: 2500)
 * @returns {Promise<string>} Data URL of final rendered fax image
 */
export const renderFaxWithAnimation = async (
  message,
  targetCanvas,
  onProgress = () => {},
  duration = 2500
) => {
  return new Promise((resolve) => {
    const width = targetCanvas.width;
    const height = targetCanvas.height;
    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });

    // Create off-screen canvas with full document
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    // Render full document to off-screen canvas
    applyPaperTexture(offscreenCtx, width, height);
    renderFaxHeader(offscreenCtx, width, message.timestamp, message.sender);
    
    const contentY = 120;
    const margin = 40;
    const maxWidth = width - (margin * 2);
    const lineHeight = 22;
    
    renderWrappedText(
      offscreenCtx,
      message.content,
      margin,
      contentY,
      maxWidth,
      lineHeight
    );
    
    applyFaxEffects(offscreenCanvas, offscreenCtx);

    // Animate progressive reveal
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Calculate how much of the image to reveal
      const revealHeight = Math.floor(height * progress);
      
      // Clear target canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Draw revealed portion
      if (revealHeight > 0) {
        ctx.drawImage(
          offscreenCanvas,
          0, 0, width, revealHeight,  // Source
          0, 0, width, revealHeight   // Destination
        );
      }
      
      // Call progress callback
      onProgress(progress);
      
      // Continue animation or finish
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const dataUrl = targetCanvas.toDataURL('image/png');
        resolve(dataUrl);
      }
    };
    
    requestAnimationFrame(animate);
  });
};
