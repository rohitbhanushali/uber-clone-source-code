import React, { useEffect, useState } from "react";
import tw from "tailwind-styled-components";
import mapboxgl from "!mapbox-gl";

// Ensure Mapbox token is available
if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    console.error('Mapbox token is missing. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file');
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Map({ pickup, dropoff }) {
    const [map, setMap] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        // Initialize map
        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/streets-v11",
            center: [75.8366318, 25.1389012],
            zoom: 3
        });

        map.on('load', () => {
            setMap(map);
        });

        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    setCurrentLocation([longitude, latitude]);
                    
                    // Add current location marker with blue circle
                    new mapboxgl.Marker({ color: '#00FF00' })
                        .setLngLat([longitude, latitude])
                        .addTo(map);

                    // Add blue circle for current location
                    if (map.isStyleLoaded()) {
                        map.addSource('current-location', {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [longitude, latitude]
                                }
                            }
                        });

                        map.addLayer({
                            id: 'current-location-circle',
                            type: 'circle',
                            source: 'current-location',
                            paint: {
                                'circle-radius': 20,
                                'circle-color': '#4285F4',
                                'circle-opacity': 0.3,
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#4285F4'
                            }
                        });

                        // Add a small dot for current location
                        map.addLayer({
                            id: 'current-location-dot',
                            type: 'circle',
                            source: 'current-location',
                            paint: {
                                'circle-radius': 4,
                                'circle-color': '#4285F4',
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#FFFFFF'
                            }
                        });
                    }
                    
                    // Center map on current location
                    map.flyTo({
                        center: [longitude, latitude],
                        zoom: 14
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }

        return () => map.remove();
    }, []);

    useEffect(() => {
        if (!map) return;

        // Clear existing markers and routes
        const markers = document.getElementsByClassName('mapboxgl-marker');
        while (markers[0]) {
            markers[0].remove();
        }

        // Remove existing route if any
        if (map.getSource('route')) {
            map.removeLayer('route');
            map.removeSource('route');
        }

        // Add pickup marker if coordinates exist
        if (pickup && pickup.length === 2 && pickup[0] !== 0 && pickup[1] !== 0) {
            new mapboxgl.Marker({ color: '#000000' })
                .setLngLat(pickup)
                .addTo(map);
        }

        // Add dropoff marker if coordinates exist
        if (dropoff && dropoff.length === 2 && dropoff[0] !== 0 && dropoff[1] !== 0) {
            new mapboxgl.Marker({ color: '#FF0000' })
                .setLngLat(dropoff)
                .addTo(map);
        }

        // Draw route if both pickup and dropoff exist
        if (pickup && dropoff && 
            pickup.length === 2 && dropoff.length === 2 && 
            pickup[0] !== 0 && pickup[1] !== 0 && 
            dropoff[0] !== 0 && dropoff[1] !== 0) {
            
            // Get route between pickup and dropoff
            fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup[0]},${pickup[1]};${dropoff[0]},${dropoff[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
            )
            .then(res => res.json())
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0].geometry;
                    
                    if (map.getSource('route')) {
                        map.removeLayer('route');
                        map.removeSource('route');
                    }

                    map.addSource('route', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: route
                        }
                    });

                    map.addLayer({
                        id: 'route',
                        type: 'line',
                        source: 'route',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': '#3B82F6',
                            'line-width': 4,
                            'line-opacity': 0.75
                        }
                    });

                    // Fit bounds to show the entire route
                    const bounds = new mapboxgl.LngLatBounds(pickup, dropoff);
                    map.fitBounds(bounds, {
                        padding: 60
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching route:', error);
            });
        }
    }, [map, pickup, dropoff]);

    return <Wrapper id="map"></Wrapper>;
}

const Wrapper = tw.div`
  flex-1 h-1/2
`;