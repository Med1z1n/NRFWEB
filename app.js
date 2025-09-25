const serviceUUID = '4a980001-1cc4-e7c1-c757-f1267dd021e8';
const charUUID = '4a980002-1cc4-e7c1-c757-f1267dd021e8';

// Separate normal + secret backgrounds
const normalBackgrounds = [
    'background7.jpg',
    'background8.jpg',
    'background10.jpg',
    'background.jpg',
];

const secretBackgrounds = [
    'background2.jpg',
    'background3.jpg',
    'background4.jpg',
    'background5.jpg',
    'background6.png',
    'background9.jpg',
    'background11.jpg',
];

let backgrounds = [...normalBackgrounds]; // start with only normal
let bgIndex = 0;

let device;
let characteristic;
let connected = false; // track BLE connection state

// Preload all images
[...normalBackgrounds, ...secretBackgrounds].forEach(src => {
  const img = new Image();
  img.src = src;
});

// Resize text to fit container
function fitTextToBox(element) {
    const parent = element.parentElement;
    let fontSize = 40;
    element.style.fontSize = fontSize + "px";

    while ((element.scrollWidth > parent.clientWidth || element.scrollHeight > parent.clientHeight) && fontSize > 10) {
        fontSize -= 1;
        element.style.fontSize = fontSize + "px";
    }
}

// Change background
document.getElementById('changeBackgroundButton').addEventListener('click', () => {
    if (backgrounds.length === 0) return;

    document.body.style.backgroundImage =
      `url('${backgrounds[bgIndex]}?v=${Date.now()}')`;

    bgIndex = (bgIndex + 1) % backgrounds.length;
});

// Update message and resize text
function updateMessage(text) {
    const msgLabel = document.getElementById("messageLabel");
    msgLabel.textContent = text;
    fitTextToBox(msgLabel);
}

// Connect BLE
document.getElementById('connectButton').addEventListener('click', async () => {
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

        connected = true;
        // Unlock secret backgrounds
        backgrounds = [...normalBackgrounds, ...secretBackgrounds];

        updateMessage("Connected! Secret backgrounds unlocked 💖");
    } catch (error) {
        console.error(error);
        alert("Failed to connect: " + error);
    }
});

function handleNotification(event) {
    const value = event.target.value;
    const rawMessage = new TextDecoder().decode(value);

    if (rawMessage.startsWith("1:") || rawMessage.startsWith("2:")) {
        const [code, ...rest] = rawMessage.split(":");
        const message = rest.join(":");
        updateMessage(message);
    } else if (rawMessage === "3") {
        console.log("Button 3");
        updateMessage("You clicked the wrong button, but I'm glad you did...");
    } else if (rawMessage === "4") {
        console.log("Button 4");
        updateMessage("You clicked the wrong button, but I'm glad you did...");
    } else {
        updateMessage(rawMessage);
    }
}
