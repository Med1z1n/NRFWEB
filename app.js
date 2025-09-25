document.addEventListener('DOMContentLoaded', () => {
  const serviceUUID = '4a980001-1cc4-e7c1-c757-f1267dd021e8';
  const charUUID = '4a980002-1cc4-e7c1-c757-f1267dd021e8';

  // Public backgrounds (always available)
  const publicBackgrounds = [
    'background7.jpg',
    'background8.jpg',
    'background10.jpg'
    'background.jpg',
  ];

  // Secret backgrounds (previously commented out in your list)
  const secretBackgrounds = [
    'background2.jpg',
    'background3.jpg',
    'background4.jpg',
    'background5.jpg',
    'background6.png',
    'background9.jpg',
    'background11.jpg',
  ];

  // You had background10.jpg uncommented in your list; if you want it public,
  // remove it from secretBackgrounds and add to publicBackgrounds above.

  // Combined array is computed dynamically based on connection
  let isConnected = false;
  function getAvailableBackgrounds() {
    return isConnected ? [...publicBackgrounds, ...secretBackgrounds] : publicBackgrounds;
  }

  // Preload images (both sets)
  [...publicBackgrounds, ...secretBackgrounds].forEach(src => {
    const img = new Image();
    img.src = src;
  });

  let bgIndex = 0; // index into the current available list
  let device = null;
  let characteristic = null;

  // Resize text to fit container
  function fitTextToBox(element) {
    const parent = element.parentElement;
    if (!parent) return;
    let fontSize = 40; // starting font size
    element.style.fontSize = fontSize + "px";

    while ((element.scrollWidth > parent.clientWidth || element.scrollHeight > parent.clientHeight) && fontSize > 10) {
      fontSize -= 1;
      element.style.fontSize = fontSize + "px";
    }
  }

  // Update message and resize text
  function updateMessage(text) {
    const msgLabel = document.getElementById("messageLabel");
    if (!msgLabel) return;
    msgLabel.textContent = text;
    fitTextToBox(msgLabel);
  }

  // Change background handler
  const changeBtn = document.getElementById('changeBackgroundButton');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      const available = getAvailableBackgrounds();
      if (available.length === 0) return;
      // Ensure bgIndex is in-range (esp. if available length changed)
      bgIndex = bgIndex % available.length;
      document.body.style.backgroundImage = `url('${available[bgIndex]}?v=${Date.now()}')`;
      bgIndex = (bgIndex + 1) % available.length;
    });
  }

  // BLE connect handling
  const connectBtn = document.getElementById('connectButton');
  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      try {
        device = await navigator.bluetooth.requestDevice({
          filters: [{ name: "Sienna's Remote" }],
          optionalServices: [serviceUUID]
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(serviceUUID);
        characteristic = await service.getCharacteristic(charUUID);

        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleNotification);

        // connected
        isConnected = true;
        updateMessage("Connected!");
        connectBtn.innerText = "Connected";
        connectBtn.disabled = true;

        // If you want to immediately include secret backgrounds in the rotation:
        // keep current background index but ensure it is valid for the new list
        bgIndex = bgIndex % getAvailableBackgrounds().length;

        // Handle disconnect to re-lock secret images
        device.addEventListener('gattserverdisconnected', () => {
          isConnected = false;
          characteristic = null;
          device = null;
          updateMessage("Disconnected");
          connectBtn.innerText = "Connect";
          connectBtn.disabled = false;
          // clamp bgIndex to the (smaller) public list
          bgIndex = bgIndex % getAvailableBackgrounds().length;
        });

      } catch (error) {
        console.error(error);
        alert("Failed to connect: " + (error && error.message ? error.message : error));
      }
    });
  }

  // BLE notification handler
  function handleNotification(event) {
    try {
      // event.target.value is a DataView / ArrayBufferView in Chrome
      const rawMessage = new TextDecoder().decode(event.target.value);

      // If the message starts with 1: or 2:, split into code + message
      if (rawMessage.startsWith("1:") || rawMessage.startsWith("2:")) {
        const [, ...rest] = rawMessage.split(":");
        const message = rest.join(":"); // handles extra ":" in text
        updateMessage(message); // show only the message
      } else if (rawMessage === "3") {
        console.log("Button 3");
        updateMessage("You clicked the wrong button, but I'm glad you did. I put this here if you ever misclick, misremember, or just goof around. I love you Sienna. I love who you are, not that you were my Girlfriend. I'm madly in love with you.");
      } else if (rawMessage === "4") {
        console.log("Button 4");
        updateMessage("You clicked the wrong button, but I'm glad you did. I put this here if you ever misclick, misremember, or just goof around. I love you Sienna. This website is what I want to remember of us. I want to remember my last labor of love I could do for you. The last surprise I planned. The gift that would make things better, the gift that would be a testament to my love and commitment to you.");
      } else {
        updateMessage(rawMessage);
      }
    } catch (e) {
      console.error('Failed to process notification', e);
    }
  }

  // Make sure we have a sensible initial background (public only) on load
  if (!document.body.style.backgroundImage) {
    const available = getAvailableBackgrounds();
    if (available.length > 0) {
      document.body.style.backgroundImage = `url('${available[0]}')`;
      bgIndex = 1 % available.length;
    }
  }

});
