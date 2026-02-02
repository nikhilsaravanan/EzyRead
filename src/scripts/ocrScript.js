// OCR Script using Tesseract.js for EzyRead Extension
// This script handles image text extraction and integration with TTS

// Import Tesseract.js
import Tesseract from 'tesseract.js';

// OCR State Management
let isOCREnabled = false;
let tesseractWorker = null;
let isProcessing = false;

// Create and inject loading overlay for OCR processing
function createLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'ezyread-ocr-loading';
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 30px 40px;
    border-radius: 12px;
    z-index: 999999;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    display: none;
    text-align: center;
    min-width: 280px;
  `;
  
  overlay.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
      <div style="width: 40px; height: 40px; border: 4px solid #fff; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <div style="font-size: 16px; font-weight: bold;">Extracting Text from Image...</div>
      <div id="ezyread-ocr-progress" style="font-size: 12px; color: #ccc;">Initializing...</div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  document.body.appendChild(overlay);
  return overlay;
}

function showLoadingOverlay(message = "Extracting Text from Image...") {
  let overlay = document.getElementById('ezyread-ocr-loading');
  if (!overlay) {
    overlay = createLoadingOverlay();
  }
  overlay.style.display = 'block';
  const progressElement = document.getElementById('ezyread-ocr-progress');
  if (progressElement) {
    progressElement.textContent = message;
  }
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('ezyread-ocr-loading');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function updateProgress(progress) {
  const progressElement = document.getElementById('ezyread-ocr-progress');
  if (progressElement && progress) {
    const percentage = Math.round(progress.progress * 100);
    progressElement.textContent = `${progress.status}: ${percentage}%`;
  }
}

// Initialize Tesseract Worker with better configuration
async function initializeTesseractWorker() {
  if (tesseractWorker) {
    return tesseractWorker;
  }
  
  try {
    tesseractWorker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        console.log('[EzyRead OCR]', m);
        updateProgress(m);
      },
      errorHandler: (err) => {
        console.error('[EzyRead OCR] Worker error:', err);
      }
    });
    
    // No additional configuration - use defaults for maximum stability
    
    return tesseractWorker;
  } catch (error) {
    console.error('[EzyRead OCR] Failed to initialize worker:', error);
    return null;
  }
}

// Preprocess image for better OCR accuracy
function preprocessImage(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas for preprocessing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Use original dimensions but scale up if too small
        let width = img.width;
        let height = img.height;
        
        // Scale up small images for better recognition
        if (width < 300 || height < 300) {
          const scale = Math.max(300 / width, 300 / height);
          width *= scale;
          height *= scale;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Gentle contrast enhancement - convert to grayscale with mild sharpening
        const contrastFactor = 1.5; // Mild contrast boost
        const brightness = 10;      // Slight brightness increase
        
        for (let i = 0; i < data.length; i += 4) {
          // Grayscale conversion
          let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Apply gentle contrast and brightness adjustment
          gray = ((gray - 128) * contrastFactor) + 128 + brightness;
          
          // Clamp values to 0-255
          gray = Math.max(0, Math.min(255, gray));
          
          data[i] = gray;     // R
          data[i + 1] = gray; // G
          data[i + 2] = gray; // B
        }
        
        // Put processed data back
        ctx.putImageData(imageData, 0, 0);
        
        // Return processed image as data URL
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        console.warn('[EzyRead OCR] Image preprocessing failed, using original:', error);
        resolve(imageSrc);
      }
    };
    
    img.onerror = () => {
      console.warn('[EzyRead OCR] Could not load image for preprocessing, using original');
      resolve(imageSrc);
    };
    
    img.src = imageSrc;
  });
}

// Extract text from image using Tesseract
async function extractTextFromImage(imageSrc) {
  try {
    showLoadingOverlay("Initializing OCR...");
    
    // Initialize worker if needed
    const worker = await initializeTesseractWorker();
    if (!worker) {
      throw new Error('Failed to initialize OCR worker');
    }
    
    showLoadingOverlay("Recognizing text...");
    
    // Perform OCR directly on original image - preprocessing was making it worse
    const { data } = await worker.recognize(imageSrc);
    
    hideLoadingOverlay();
    
    // Minimal text cleanup - preserve structure
    const cleanedText = data.text.trim();
    
    return {
      text: cleanedText,
      confidence: data.confidence
    };
  } catch (error) {
    hideLoadingOverlay();
    console.error('[EzyRead OCR] Error extracting text:', error);
    console.error('[EzyRead OCR] Error details:', error.message, error.stack);
    
    // Show error message with more details
    showErrorMessage('Failed to extract text from image. ' + (error.message || 'Please try again.'));
    
    return null;
  }
}

// Show error message to user
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 999999;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 300px;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 4000);
}

// Show success message with extracted text preview
function showSuccessMessage(text) {
  const successDiv = document.createElement('div');
  const preview = text.substring(0, 150) + (text.length > 150 ? '...' : '');
  
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 999999;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 350px;
    word-wrap: break-word;
  `;
  
  successDiv.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px;">✓ Text Extracted Successfully</div>
    <div style="font-size: 12px; opacity: 0.9; line-height: 1.4;">${preview}</div>
  `;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

// Split text and speak using existing TTS system
function splitTextAndSpeak(text, selectedVoice) {
  const chunkSize = 200;
  const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, 'g'));

  if (chunks && chunks.length > 0) {
    let currentChunk = 0;

    function speakNextChunk() {
      if (currentChunk < chunks.length) {
        const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
        utterance.voice = selectedVoice;
        utterance.onend = () => {
          currentChunk++;
          speakNextChunk();
        };
        window.speechSynthesis.speak(utterance);
      }
    }

    speakNextChunk();
  }
}

// Read extracted text using TTS
function readExtractedText(text) {
  if (!text || text.trim() === '') {
    showErrorMessage('No text found in image.');
    return;
  }
  
  if (typeof chrome === 'undefined' || !chrome.storage) {
    console.error('[EzyRead OCR] Chrome storage API not available');
    showErrorMessage('Extension API not available. Please reload the extension.');
    return;
  }
  
  chrome.storage.local.get(['selectedVoiceName'], function(result) {
    const voiceName = result.selectedVoiceName;
    
    if (!voiceName) {
      showErrorMessage('Please select a voice in TTS settings first.');
      return;
    }
    
    const availableVoices = window.speechSynthesis.getVoices();
    const selectedVoice = availableVoices.find(voice => voice.name === voiceName);
    
    if (selectedVoice) {
      console.log('[EzyRead OCR] Reading extracted text:', text.substring(0, 50) + '...');
      splitTextAndSpeak(text, selectedVoice);
    } else {
      showErrorMessage('Selected voice not found. Please update TTS settings.');
    }
  });
}

// Add visual indicator to images when hovering
function addImageHoverEffect(img) {
  img.style.cursor = 'pointer';
  
  const originalOutline = img.style.outline;
  const originalBoxShadow = img.style.boxShadow;
  
  img.addEventListener('mouseenter', () => {
    if (isOCREnabled) {
      img.style.outline = '3px solid #4CAF50';
      img.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
    }
  });
  
  img.addEventListener('mouseleave', () => {
    img.style.outline = originalOutline;
    img.style.boxShadow = originalBoxShadow;
  });
}

// Handle image click for OCR
async function handleImageClick(event) {
  if (!isOCREnabled || isProcessing) {
    return;
  }
  
  const img = event.target;
  
  // Check if it's an actual image element
  if (img.tagName !== 'IMG') {
    return;
  }
  
  event.preventDefault();
  event.stopPropagation();
  
  isProcessing = true;
  
  try {
    console.log('[EzyRead OCR] Processing image:', img.src);
    
    const result = await extractTextFromImage(img.src);
    
    if (result && result.text && result.text.trim().length > 0) {
      console.log('[EzyRead OCR] Extracted text:', result.text);
      console.log('[EzyRead OCR] Confidence:', result.confidence);
      
      showSuccessMessage(result.text);
      
      // Read the extracted text using TTS
      readExtractedText(result.text);
    } else {
      showErrorMessage('No text found in this image.');
    }
  } catch (error) {
    console.error('[EzyRead OCR] Error processing image:', error);
    showErrorMessage('Failed to process image. Please try again.');
  } finally {
    isProcessing = false;
  }
}

// Enable OCR functionality
function enableOCR() {
  isOCREnabled = true;
  console.log('[EzyRead OCR] OCR enabled');
  
  // Add click listeners to all images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('click', handleImageClick, true);
    addImageHoverEffect(img);
  });
  
  // Observe for dynamically added images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'IMG') {
          node.addEventListener('click', handleImageClick, true);
          addImageHoverEffect(node);
        } else if (node.querySelectorAll) {
          const images = node.querySelectorAll('img');
          images.forEach(img => {
            img.addEventListener('click', handleImageClick, true);
            addImageHoverEffect(img);
          });
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Store observer for later cleanup
  window.ezyreadOCRObserver = observer;
}

// Disable OCR functionality
function disableOCR() {
  isOCREnabled = false;
  console.log('[EzyRead OCR] OCR disabled');
  
  // Remove click listeners from all images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.removeEventListener('click', handleImageClick, true);
    img.style.cursor = '';
    img.style.outline = '';
    img.style.boxShadow = '';
  });
  
  // Disconnect observer
  if (window.ezyreadOCRObserver) {
    window.ezyreadOCRObserver.disconnect();
    window.ezyreadOCRObserver = null;
  }
}

// Initialize OCR state from storage
chrome.storage.local.get(['isOCRToggleChecked'], function(result) {
  isOCREnabled = result.isOCRToggleChecked || false;
  if (isOCREnabled) {
    enableOCR();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "toggleOCR") {
    if (message.isChecked) {
      enableOCR();
    } else {
      disableOCR();
    }
  } else if (message.action === "stopSpeech") {
    // Stop any ongoing speech synthesis
    window.speechSynthesis.cancel();
    console.log('[EzyRead OCR] Speech stopped by user');
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (tesseractWorker) {
    tesseractWorker.terminate();
    tesseractWorker = null;
  }
});

console.log('[EzyRead OCR] Script loaded and ready');
