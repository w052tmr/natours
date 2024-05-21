export const displayMap = (locations) => {
    const map = L.map('map', {
        scrollWheelZoom: false,
        maxZoom: 10,
        minZoom: 3,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    let coordinates = [];
    locations.forEach((location) =>
        coordinates.push([
            location.coordinates[1] * 1,
            location.coordinates[0] * 1,
        ])
    );

    const bounds = L.latLngBounds(coordinates);

    const center = bounds.getCenter();

    map.fitBounds(bounds);
    const zoom = map.getZoom() - 1;

    map.setView(center, zoom);

    for (i = locations.length - 1; i >= 0; i--) {
        const currentLocation = locations[i];
        const [lng, lat] = currentLocation.coordinates;

        const marker = L.marker([lat * 1, lng * 1], {
            riseOnHover: true,
            riseOffset: 250,
            title: `Day ${currentLocation.day}: ${currentLocation.description}`,
        }).addTo(map);

        marker
            .bindPopup(
                `<h1>Day ${currentLocation.day}: ${currentLocation.description}</h1>`,
                {
                    autoClose: false,
                    closeOnClick: false,
                    className: 'leaflet-popup',
                }
            )
            .openPopup();
    }
};
