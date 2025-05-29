import React, { useEffect, useState } from 'react';
import tw from "tailwind-styled-components";
import Map from "../components/Map";
import { useRouter } from "next/router";
import Link from 'next/link'
import RideSelector from '../components/RideSelector'

export default function Confirm() {
    const router = useRouter();
    const { pickup, dropoff } = router.query;
  
    const [pickupCoordinates, setPickupCoordinates] = useState([0,0]);
    const [dropoffCoordinates, setDropoffCoordinates] = useState([0,0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    const searchLocation = async (query) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
                new URLSearchParams({
                    access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
                    limit: 5,
                    types: 'place,address,poi'
                })
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to search location');
            }

            return data.features || [];
        } catch (error) {
            console.error('Error searching location:', error);
            return [];
        }
    };

    const getCoordinates = async (location, isPickup) => {
        try {
            const features = await searchLocation(location);
            
            if (features.length === 0) {
                throw new Error(`No results found for ${location}`);
            }

            // Use the first result
            const coordinates = features[0].center;
            if (isPickup) {
                setPickupCoordinates(coordinates);
            } else {
                setDropoffCoordinates(coordinates);
            }
        } catch (error) {
            console.error(`Error getting ${isPickup ? 'pickup' : 'dropoff'} coordinates:`, error);
            setError(error.message);
        }
    };
    
    useEffect(() => {
        if (!pickup || !dropoff) return;

        setLoading(true);
        setError(null);

        Promise.all([
            getCoordinates(pickup, true),
            getCoordinates(dropoff, false)
        ]).finally(() => {
            setLoading(false);
        });
    }, [pickup, dropoff]);

    if (loading) {
        return (
            <Wrapper>
                <LoadingText>Loading...</LoadingText>
            </Wrapper>
        );
    }

    if (error) {
        return (
            <Wrapper>
                <ErrorText>{error}</ErrorText>
                <Link href="/search">
                    <BackButton>Go Back</BackButton>
                </Link>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <ButtonContainer>
                <Link href="/search">
                    <BackButton src="https://img.icons8.com/ios-filled/50/000000/left.png" />
                </Link>
            </ButtonContainer>
            <Map
                pickup={pickupCoordinates}
                dropoff={dropoffCoordinates}
            />
            <RideContainer>
                <RideSelector
                    pickup={pickupCoordinates}
                    dropoff={dropoffCoordinates}
                />
                <ConfirmButtonContainer>
                    <ConfirmButton>Confirm Uber</ConfirmButton>
                </ConfirmButtonContainer>
            </RideContainer>
        </Wrapper>
    )
}

const Wrapper = tw.div`
    flex h-screen flex-col
`;

const ButtonContainer = tw.div`
    rounded-full absolute top-4 left-4 z-10 bg-white shadow-md cursor-pointer
`;

const BackButton = tw.img`
    h-10 cursor-pointer
`;

const ConfirmButton = tw.div`
    bg-black text-white m-4 text-center py-4
`;

const ConfirmButtonContainer = tw.div`
    border-t-2
`;

const RideContainer = tw.div`
    flex-1 flex flex-col h-1/2
`;

const LoadingText = tw.div`
    flex items-center justify-center h-screen text-xl
`;

const ErrorText = tw.div`
    flex items-center justify-center h-screen text-xl text-red-500
`;