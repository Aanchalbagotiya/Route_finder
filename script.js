// Initialize Leaflet map centered on a smaller region (e.g., downtown of a city)
const map = L.map('map').setView([40.7128, -74.0060], 13); // Example: New York City downtown

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Locations in a smaller region (adjust coordinates for a smaller area)
const places = {
    'Location A': [40.7128, -74.0060], // Starting point
    'Location B': [40.7250, -74.0020], // Moved further away
    'Location C': [40.7100, -74.0200], // Moved further away
    'Location D': [40.7400, -74.0100], // Moved further away
    'Location E': [40.7500, -74.0035], // Moved further away
    'Location F': [40.7550, -74.0200], // Moved further away
    'Location G': [40.7650, -74.0080], // Moved further away
    'Location H': [40.7200, -74.0250], // Moved further away
    'Location I': [40.7300, -74.0110], // Moved further away
    'Location J': [40.7400, -74.0070], // Moved further away
    'Location K': [40.7600, -74.0120], // Moved further away
    'Location L': [40.7700, -74.0030], // Moved further away
    'Location M': [40.7200, -74.0010], // Moved further away
    'Location N': [40.7185, -74.0195], // Moved further away
    'Location O': [40.7520, -74.0165], // Moved further away
    'Location P': [40.7270, -74.0125], // Moved further away
    'Location Q': [40.7155, -74.0150], // Moved further away
    'Location R': [40.7110, -74.0130], // Moved further away
    'Location S': [40.7750, -74.0185], // Moved further away
    'Location T': [40.7245, -74.0115], // Moved further away
    'Location U': [40.7405, -74.0140]
};

// Add markers for each location
Object.keys(places).forEach(place => {
    L.marker(places[place])
        .bindPopup(place)
        .addTo(map);
});

// Dijkstra's Algorithm graph for shorter distances (simplified)
const graph = {
    'Location A': { 'Location B': 1, 'Location C': 2, 'Location F': 3 },
    'Location B': { 'Location A': 1, 'Location D': 2, 'Location E': 2, 'Location G': 4 },
    'Location C': { 'Location A': 2, 'Location D': 1, 'Location H': 3 },
    'Location D': { 'Location B': 2, 'Location C': 1, 'Location E': 3, 'Location I': 2 },
    'Location E': { 'Location B': 2, 'Location D': 3, 'Location J': 1 },
    'Location F': { 'Location A': 3, 'Location G': 2, 'Location K': 4 },
    'Location G': { 'Location B': 4, 'Location F': 2, 'Location L': 3 },
    'Location H': { 'Location C': 3, 'Location I': 2, 'Location M': 1 },
    'Location I': { 'Location D': 2, 'Location H': 2, 'Location N': 4 },
    'Location J': { 'Location E': 1, 'Location K': 3 },
    'Location K': { 'Location F': 4, 'Location J': 3, 'Location O': 2 },
    'Location L': { 'Location G': 3, 'Location M': 2, 'Location P': 1 },
    'Location M': { 'Location H': 1, 'Location L': 2, 'Location Q': 4 },
    'Location N': { 'Location I': 4, 'Location O': 1, 'Location R': 3 },
    'Location O': { 'Location K': 2, 'Location N': 1, 'Location S': 2 },
    'Location P': { 'Location L': 1, 'Location Q': 2, 'Location T': 3 },
    'Location Q': { 'Location M': 4, 'Location P': 2, 'Location U': 1 },
    'Location R': { 'Location N': 3, 'Location S': 1 },
    'Location S': { 'Location O': 2, 'Location R': 1, 'Location T': 2 },
    'Location T': { 'Location P': 3, 'Location U': 2 },
    'Location U': { 'Location Q': 1, 'Location T': 2 }
};

// Dijkstra's algorithm implementation
function dijkstra(start, end) {
    const distances = {};
    const previous = {};
    const queue = new Set(Object.keys(graph));

    // Initialize distances
    Object.keys(graph).forEach(node => distances[node] = Infinity);
    distances[start] = 0;

    while (queue.size > 0) {
        const currentNode = [...queue].reduce((minNode, node) =>
            distances[node] < distances[minNode] ? node : minNode
        );
        queue.delete(currentNode);

        if (currentNode === end) break;

        Object.keys(graph[currentNode]).forEach(neighbor => {
            const alt = distances[currentNode] + graph[currentNode][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = currentNode;
            }
        });
    }

    // Build the path
    const path = [];
    let node = end;
    while (previous[node]) {
        path.unshift(node);
        node = previous[node];
    }
    if (node === start) path.unshift(start);
    return { path, distance: distances[end] };
}

// Handle the "Find Shortest Route" button click
let routeLine; // To store the route line
document.getElementById('findRouteBtn').addEventListener('click', () => {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    
    if (origin && destination) {
        const { path, distance } = dijkstra(origin, destination);
        
        // Display result with location names
        const pathNames = path.map(location => location).join(' -> ');
        document.getElementById('result').textContent = `Shortest route from ${origin} to ${destination} is ${distance} units long: ${pathNames}`;

        // Remove previous route line if it exists
        if (routeLine) {
            map.removeLayer(routeLine);
        }

        // Create a new polyline for the route
        const routeCoords = path.map(location => places[location]);
        routeLine = L.polyline(routeCoords, { color: 'blue' }).addTo(map);
        
        // Fit the map view to the route
        map.fitBounds(routeLine.getBounds());
    } else {
        alert('Please select both origin and destination.');
    }
});

// Populate the origin and destination select dropdowns
const originSelect = document.getElementById('origin');
const destinationSelect = document.getElementById('destination');

// Populate select options
Object.keys(places).forEach(place => {
    const option = document.createElement('option');
    option.value = place;
    option.textContent = place;
    originSelect.appendChild(option.cloneNode(true));
    destinationSelect.appendChild(option);
});
