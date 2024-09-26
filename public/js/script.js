const socket = io(); // Initialize the socket connection

let isPrimary = false; // Flag to determine if this tab is primary
let userId = Math.random().toString(36).substring(2, 15); // Unique user ID for this session

// Check for geolocation support
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Emit the location to the server
            socket.emit("send-location", { id: userId, latitude, longitude });
        },
        (error) => {
            console.error("Error retrieving location:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// Initialize the Leaflet map
const map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© Devildebug07'
}).addTo(map);

const markers = {};

// Listen for incoming location updates from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    if (markers[id]) {
        // Update existing marker position
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker and add it to the map
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User: ${id}`)
            .openPopup();
    }
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]); // Remove marker from the map
        delete markers[id]; // Delete from markers object
    }
});

// Set primary tab flag
window.addEventListener('focus', () => {
    isPrimary = true;
});

// Set secondary tab flag
window.addEventListener('blur', () => {
    isPrimary = false;
});
