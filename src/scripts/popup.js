document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners to tabs
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  

  // Add event listener to close button
  const closeButton = document.querySelector('.closeButton');
  closeButton.addEventListener('click', function() {
    document.querySelector('.container').style.display = 'none';
  });
  });
});

const colorBlindOptions = document.querySelectorAll('input[name="colorBlindOption"]');
  colorBlindOptions.forEach(option => {
    option.addEventListener('change', function() {
      const selectedType = document.querySelector('input[name="colorBlindOption"]:checked').value;
      applyColorblindFilter(selectedType);
    });
  });

  // Function to apply colorblind filter based on the selected type
  function applyColorblindFilter(type) {
    let filterValue = '';

    switch (type) {
      case 'normal':
        filterValue = 'none';
        break;
      case 'deuteranomaly':
        // Apply the SVG color matrix for deuteranomaly
        filterValue = 'sepia(0.2) hue-rotate(55deg) saturate(0.8) contrast(1.2)';
        break;
      case 'protanomaly':
        filterValue = 'sepia(0.3) hue-rotate(65deg) saturate(0.8) contrast(1.2)';
        break;
      case 'tritanomaly':
        filterValue = 'sepia(0.4)  hue-rotate(332deg) saturate(1.6)  contrast(1.0)';
        break;
    }

    // Apply the filter to the popup body
    document.body.style.filter = filterValue;
  }

document.addEventListener('DOMContentLoaded', function() {
  const sectionContent = document.querySelector('.section');
  const boxContainer = document.getElementById('boxes4');
  const backBoxContainer = document.getElementById('backBoxes4');
  const textToSpeechContent = document.getElementById('textToSpeechContent');
  const colorBlindContent = document.getElementById('colorBlindContent');
  const languageContent = document.getElementById('languageContent');
  const fontContent = document.getElementById('fontSizeContent');
  const backButton = document.querySelector('.backButton');
  const backButton2 = document.querySelector('.backButton2');
  const backButton3 = document.querySelector('.backButton3');
  const backButton4 = document.querySelector('.backButton4');
  const contact = document.querySelector('.contact');
  const linkWebsite = document.querySelector('.linkWebsite');


  function showContent(content) {
    textToSpeechContent.style.display = 'none';
    colorBlindContent.style.display = 'none';
    languageContent.style.display = 'none';
    fontContent.style.display = 'none';
    sectionContent.style.display = 'none';
    content.style.display = 'block';
    if (content !== sectionContent) {
      backButton.style.display = 'block';
      if (contact) contact.style.marginBottom = '0px';
      if (linkWebsite) linkWebsite.style.marginBottom = '0px';
    } else {
      backButton.style.display = 'none';
      if (contact) contact.style.marginBottom = '10px';
      if (linkWebsite) linkWebsite.style.marginBottom = '10px';
    }
  }

  document.getElementById('ttsBox').addEventListener('click', function() {
    showContent(textToSpeechContent);
  });

  document.getElementById('colorBlindBox').addEventListener('click', function() {
    showContent(colorBlindContent);
  });

  document.getElementById('fontSizeBox').addEventListener('click', function() {
    showContent(fontContent);
  });

  backButton.addEventListener('click', function() {
    showContent(sectionContent);
  });

  backButton2.addEventListener('click', function() {
    showContent(sectionContent);
  });
  backButton3.addEventListener('click', function() {
    showContent(sectionContent);
  });
  backButton4.addEventListener('click', function() {
    showContent(sectionContent);
  });

});

// Function to open YouTube with the search query based on the URL
function openYouTubeWithSearchQuery() {
  // Get the current tab's URL
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentURL = tabs[0].url;
    const urlParts = new URL(currentURL);
    // Split the URL into words based on slashes (/)
    const words = currentURL.split('/').filter(word => word !== "");

    // Filter words to keep only those containing hyphens (-)
    const wordsWithHyphens = words.filter(word => word.includes('-'));

    // Remove .html extension from words if present
    const wordsWithoutHtml = wordsWithHyphens.map(word => word.replace(/\.html$/, ''));

    // Join the words to form the final string
    const searchQuery = wordsWithoutHtml.join(' ');

    // Create the final YouTube search URL
    const youtubeSearchURL = `https://www.youtube.com/results?search_query=${searchQuery}`;

    // Open YouTube with the search query in a new tab
    chrome.tabs.create({ url: youtubeSearchURL });
  });
}

// Find the "View Videos" button by its ID and set its click event to open YouTube with search query
const viewVideosButton = document.getElementById('viewVideosButton');
if (viewVideosButton) {
  viewVideosButton.addEventListener('click', openYouTubeWithSearchQuery);
}

// In popup.js
document.addEventListener('DOMContentLoaded', function() {
  // Populate the TTS voices dropdown with the available voices and select the previously selected voice (if any)
  const ttsVoicesDropdown = document.getElementById('ttsVoicesDropdown');

  function populateVoicesDropdown(selectedVoiceName) {
    const availableVoices = window.speechSynthesis.getVoices();

    ttsVoicesDropdown.innerHTML = '';

    availableVoices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.text = `${voice.name} - ${voice.lang}`;
      ttsVoicesDropdown.appendChild(option);
    });

    if (selectedVoiceName) {
      ttsVoicesDropdown.value = selectedVoiceName;
    }
  }

  // Add an event listener to update the dropdown when voices are loaded and retrieve the previously selected voice
  window.speechSynthesis.onvoiceschanged = function() {
    chrome.storage.local.get('selectedVoiceName', function(data) {
      const selectedVoiceName = data.selectedVoiceName;
      populateVoicesDropdown(selectedVoiceName);
    });
  };

  // Call the function initially to populate the dropdown with the previously selected voice (if any)
  chrome.storage.local.get('selectedVoiceName', function(data) {
    const selectedVoiceName = data.selectedVoiceName;
    populateVoicesDropdown(selectedVoiceName);
  });

  // Add an event listener to the dropdown to handle voice selection and save the selected voice to Chrome storage
  ttsVoicesDropdown.addEventListener('change', function() {
    const selectedVoiceName = ttsVoicesDropdown.value;
    chrome.storage.local.set({ selectedVoiceName: selectedVoiceName });
  });

  // Add an event listener to the ttsButton to speak the test phrase with the selected voice
  const ttsButton = document.getElementById('ttsChangeTest');
  ttsButton.addEventListener('click', function() {
    const selectedVoiceName = ttsVoicesDropdown.value;
    const availableVoices = window.speechSynthesis.getVoices();
    const selectedVoice = availableVoices.find(voice => voice.name === selectedVoiceName);

    if (selectedVoice) {
      const utterance = new SpeechSynthesisUtterance('This is a test');
      utterance.voice = selectedVoice;
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Selected voice not found.');
    }
  });

  // Add an event listener to the "Apply Changes" button
  const applyChangesButton = document.getElementById('applyChangesButton');
  applyChangesButton.addEventListener('click', function() {
    // Send a message to the content script to read the highlighted text with the selected voice
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "readHighlightedText" });
    });
  });

  // Add an event listener to the "Stop Speech" button
  const ttsStopButton = document.getElementById('ttsStopButton');
  if (ttsStopButton) {
    ttsStopButton.addEventListener('click', function() {
      // Stop speech in popup
      window.speechSynthesis.cancel();
      
      // Send message to content script to stop speech
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "stopSpeech" });
        }
      });
    });
  }
});

// Function to update the status of lexileToggle in Chrome storage
function updateLexileToggleStatus(checked) {
  chrome.storage.local.set({ isLexileToggleChecked: checked });
}

// Add an event listener to the lexileToggle checkbox
const lexileToggle = document.getElementById('lexileToggle');

// Retrieve the previous state of lexileToggle from Chrome storage
chrome.storage.local.get(['isLexileToggleChecked'], function(result) {
  lexileToggle.checked = result.isLexileToggleChecked || false;
});

lexileToggle.addEventListener('change', function() {
  const isChecked = lexileToggle.checked;
  updateLexileToggleStatus(isChecked);
  // Send a message to the content script to toggle the altPopup
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleLexilePopup", isChecked: isChecked });
  });
});

// OCR Toggle functionality
function updateOCRToggleStatus(checked) {
  chrome.storage.local.set({ isOCRToggleChecked: checked });
}

const ocrToggle = document.getElementById('ocrToggle');

// Retrieve the previous state of ocrToggle from Chrome storage
chrome.storage.local.get(['isOCRToggleChecked'], function(result) {
  ocrToggle.checked = result.isOCRToggleChecked || false;
});

ocrToggle.addEventListener('change', function() {
  const isChecked = ocrToggle.checked;
  updateOCRToggleStatus(isChecked);
  // Send a message to the content script to toggle OCR functionality
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleOCR", isChecked: isChecked });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const syllableHighlightToggle = document.getElementById("syllableHighlightToggle");

  // Load the toggle state from storage and set the checkbox accordingly
  chrome.storage.sync.get("highlightingEnabled", function (data) {
    const enableHighlighting = data.highlightingEnabled || false;
    syllableHighlightToggle.checked = enableHighlighting;
    // Send a message to the content script to enable or disable highlighting
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { enableHighlighting });
    });
  });

  // Listen for changes in the toggle switch
  syllableHighlightToggle.addEventListener("change", function () {
    const enableHighlighting = syllableHighlightToggle.checked;
    // Save the toggle state to storage
    chrome.storage.sync.set({ "highlightingEnabled": enableHighlighting });
    // Send a message to the content script to enable or disable highlighting
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { enableHighlighting });
    });
  });

  // Listen for page reloads or updates
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
      // Get the latest toggle state from storage
      chrome.storage.sync.get("highlightingEnabled", function (data) {
        const enableHighlighting = data.highlightingEnabled || false;
        // Send a message to the content script to enable or disable highlighting based on the latest state
        chrome.tabs.sendMessage(tabId, { enableHighlighting });
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const fontFamilyDropdown = document.getElementById('fontFamilyDropdown');
  const fontSizeDropdown = document.getElementById('fontSizeDropdown');
  const lineSpacingDropdown = document.getElementById('lineSpacingDropdown');
  
  fontFamilyDropdown.addEventListener('change', function() {
    const selectedFont = fontFamilyDropdown.value;
    changeFontFamily(selectedFont);
  });
  
  fontSizeDropdown.addEventListener('change', function() {
    const selectedFontSize = fontSizeDropdown.value;
    changeFontSize(selectedFontSize);
  });

  lineSpacingDropdown.addEventListener('change', function() {
    const selectedSpacing = lineSpacingDropdown.value;
    changeLineSpacing(selectedSpacing);
  });

  const colorBlindOptions = document.querySelectorAll('input[name="colorBlindOption"]');
  colorBlindOptions.forEach(option => {
    option.addEventListener('change', function() {
      const selectedType = document.querySelector('input[name="colorBlindOption"]:checked').value;
      changeColorblindFilter(selectedType);
    });
  });
});


function changeFontFamily(font) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: setFont,
      args: [font],
    });
  });
}

function setFont(font) {
  const style = document.createElement('style');
  style.innerHTML = `* {
    font-family: '${font}', sans-serif !important;
  }`;
  document.head.appendChild(style);
}

function changeFontSize(fontSize) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: setFontSize,
      args: [fontSize],
    });
  });
}

function setFontSize(fontSize) {
  const style = document.createElement('style');
  style.innerHTML = `* {
    font-size: ${fontSize} !important;
  }`;
  document.head.appendChild(style);
}

function changeLineSpacing(spacing) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: setLineSpacing,
      args: [spacing],
    });
  });
}

function setLineSpacing(spacing) {
  let newLineHeight = null;
  
    switch (spacing) {
      case "spacing1":
        newLineHeight = "normal";
        break;
      case "spacing2":
        newLineHeight = "40px";
        break;
      case "spacing3":
        newLineHeight = "50px";
        break;
      case "spacing4":
        newLineHeight = "60px";
        break;
      case "spacing5":
        newLineHeight = "70px";
        break;
      // Add more cases for additional line spacing options if needed
      default:
        newLineHeight = "normal";
    }
  const style = document.createElement('style');
  style.innerHTML = `* {
    line-height: ${newLineHeight} !important;
  }`;
  document.head.appendChild(style);
}

function changeColorblindFilter(type) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: applyColorblindFilter,
      args: [type],
    });
  });
}

function applyColorblindFilter(type) {
  let filterValue = 'none'; // Default filter value

  switch (type) {
    case 'deuteranomaly':
      // Apply the SVG color matrix for deuteranomaly
      filterValue = 'sepia(0.2) hue-rotate(55deg) saturate(0.8) contrast(1.2)';
      break;
    case 'protanomaly':
      filterValue = 'sepia(0.3) hue-rotate(65deg) saturate(0.8) contrast(1.2)';
      break;
    case 'tritanomaly':
      filterValue = 'sepia(0.4)  hue-rotate(332deg) saturate(1.6)  contrast(1.0)';
      break;
  }

  const style = document.createElement('style');
  style.innerHTML = `body { filter: ${filterValue} !important; }`
  document.body.appendChild(style);
}

document.getElementById('languageBox').addEventListener('click', function() {
  // Open the new tab when the button is clicked
  chrome.tabs.create({ url: chrome.runtime.getURL('src/pages/index.html') }); // Replace 'newtab.html' with the actual file name
});

// Section 1: Event Listener for DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {

  // Section 2: Button Click Handler to Show Information in New Tab
  function showInfoInNewTab() {
    const information = `
    <!DOCTYPE html>
    <html>

    <head>
      <meta charset="UTF-8">
      <title>EzyRead Information</title>
      <link href="https://fonts.googleapis.com/css2?family=TrebuchetMS:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Trebuchet MS', sans-serif;
          background-image: linear-gradient(to bottom, #98d3e6, #b2ebf2, #D4FADF, #C0F5C4);
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #009688;
          font-size: 24px;
        }
        p {
          font-size: 18px;
          line-height: 1.6;
        }
        li {
          font-size: 18px;
          line-height: 1.6;
        }
        ul {
          padding-left: 20px;
        }
        nav {
          background-color: #98d3e6;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        nav img {
          height: 30px;
          margin-right: 15px;
        }
        nav a {
          color: #fff;
          text-decoration: none;
          font-size: 18px;
          font-family: 'Trebuchet MS', sans-serif;
          margin-left: 10px;
        }
        a:hover {
          border-bottom: 3px solid #fff; 
        }
        a:hover {
          color: #ff4500;
        button {
          margin-top: 20px;
          color: #fff;
          background-color: #009688;
          border: none;
          cursor: pointer;
          font-family: 'Trebuchet MS', sans-serif;
        }
      </style>
    </head>

    <body>
      <!-- Navigation bar with logo -->
      <nav>
        <img src="https://i.ibb.co/SsZbbkW/title.png" alt="EzyRead Logo" style="width: 200px; height: auto;">
        <div style="display: flex; gap: 20px;">
          <a href="https://stjudes.com.au/news/is-intellectual-disability-the-same-as-learning-disability/" target="_blank" style="color: #333;"> Learn more </a>
          <a href="mailto:EzyReadHelp@gmail.com" target="_blank" style="color: #333;"> Contact us </a>
        </div>
      </nav>

      <div style="padding: 20px;">
        <h1>What is EzyRead?</h1>
        <p>EzyRead is a Google Extension designed by Amogh, Rishik, Nikhil, and Abhiram, 4 students from Round Rock High School, to provide a range of accessibility tools for individuals with Intellectual or Developmental Disabilities (IDD), Learning Disabilities, or Visual Impairment. This extension can also be used by anyone seeking enhanced accessibility options.</p>

        <h1>What features does EzyRead have?</h1>
        <p>EzyRead offers a diverse range of features to enhance the user experience, including a text-to-speech function, customizable color filters, integration with related videos, part-of-speech identifier, and multiple accessibility options such as font customization, font size adjustment, background color selection, line spacing modification, and an alternating syllable highlighter.</p>

        <h1>What is Intellectual or Developmental Disabilities (IDD) and Learning Disabilities?</h1>
        <p>Intellectual or Developmental Disabilities encompass a wide variety of conditions that result in an impairment of intellectual functioning, adaptive functioning, and sometimes even behavioral and physical areas. Intellectual functioning refers to things such as problem-solving, understanding, and learning, while adaptive functioning refers to an individual's ability to be independent and complete real-life tasks. Examples include brushing teeth and getting ready. Learning Disabilities refer to factors that can make it more challenging for an individual to learn.</p>

        <h1>What are different conditions that individuals may face due to IDD's and Learning Disabilities?</h1>
        <p>Individuals with Intellectual or Developmental Disabilities (IDD) may experience conditions such as Attention Deficit Hyperactivity Disorder (ADHD), Down Syndrome, Cerebral Palsy, and occasionally Autism. On the other hand, individuals with learning disabilities may have dyslexia, dysgraphia, dyscalculia, and others.</p>

        <h1>How does EzyRead help students facing these disorders?</h1>
        <p>As mentioned earlier, EzyRead has a wide range of features that cater to students with IDD, learning disabilities, or visual impairments, helping them learn more effectively.</p>

        <ul>
          <li>For individuals with visual impairments or low vision, EzyRead provides text-to-speech, color filters, and background color modification to enhance readability and comprehension.</li>
          <li>For individuals with dyslexia, EzyRead offers an alternating syllable highlighter, text-to-speech, and customizable fonts to improve reading skills and reduce reading difficulties. Moreover, users can access videos directly related to the article, providing an alternative in the form of visual learning.</li>
          <li>Individuals with Autism may find features like color filters, font customization, and speech assistance helpful for enhancing visual comfort and supporting communication.</li>
          <li>Individuals with ADHD can utilize customizable features like font size, line spacing, and background color to improve focus and readability, leading to clearer comprehension and understanding of the content.</li>
          <li>For individuals with IDD, EzyRead's text-to-speech, speech assistant, and related videos features are designed to enhance their learning and comprehension.</li>
        </ul>

        <h1>Overall</h1>
        <p>Our extension is designed to cater to diverse needs, providing users with a more accessible and enriching learning experience.</p>
      </div>
    </body>

    </html>`;
  
    const newTab = window.open();
    newTab.document.write(information);
    newTab.document.querySelector('.logo').style.maxWidth = '200px'; // Set the max-width for resizable logo
  }

  // Section 3: Add Click Event Listener to the Button
  const showInfoBtn = document.getElementById('info');
  if (showInfoBtn) {
    showInfoBtn.addEventListener('click', showInfoInNewTab);
  }

  document.getElementById("contactUs").addEventListener("click", function() {
    window.location.href = "mailto:EzyReadHelp@gmail.com";
  });
});









