const serviceUUID = '4a980001-1cc4-e7c1-c757-f1267dd021e8';
const charUUID = '4a980002-1cc4-e7c1-c757-f1267dd021e8';

const backgrounds = [
    
   // 'background2.jpg',
   // 'background3.jpg',
   // 'background4.jpg',
   // 'background5.jpg',
   //  'background6.png',
    'background7.jpg',
    'background8.jpg',
   // 'background9.jpg',
    'background10.jpg',
   // 'background11.jpg',
    'background.jpg',
];

let bgIndex = 0; // current background index

let device;
let characteristic;

backgrounds.forEach(src => {
  const img = new Image();
  img.src = src;
});

// Resize text to fit container
function fitTextToBox(element) {
    const parent = element.parentElement;
    let fontSize = 40; // starting font size
    element.style.fontSize = fontSize + "px";

    while ((element.scrollWidth > parent.clientWidth || element.scrollHeight > parent.clientHeight) && fontSize > 10) {
        fontSize -= 1;
        element.style.fontSize = fontSize + "px";
    }
}

// change background
document.getElementById('changeBackgroundButton').addEventListener('click', () => {
    // cycle to the next background
    //document.body.style.backgroundImage = `url('${backgrounds[bgIndex]}')`;
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


document.getElementById('connectButton').addEventListener('click', async () => {
    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'Cycler' }],
            optionalServices: [serviceUUID]
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(serviceUUID);
        characteristic = await service.getCharacteristic(charUUID);

        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleNotification);

        updateMessage("Connected!");
    } catch (error) {
        console.error(error);
        alert("Failed to connect: " + error);
    }
});

function handleNotification(event) {
    const value = event.target.value;
    const rawMessage = new TextDecoder().decode(value);
    If the message starts with 1: or 2:, split into code + message
    if (rawMessage.startsWith("1:") || rawMessage.startsWith("2:")) {
        const [code, ...rest] = rawMessage.split(":");
        const message = rest.join(":"); // handles extra ":" in text
        updateMessage(message); // show only the message
    } 
    // If it's just "3" or "4", handle as controller input
    else if (rawMessage === "3") {
        console.log("Button 3 pressed → game control");
        // add your game logic here
    } 
    else if (rawMessage === "4") {
        console.log("Button 4 pressed → game control");
        // add your game logic here
    } 
    // fallback for any unexpected payloads
    else {
        updateMessage(rawMessage);
    }
}
