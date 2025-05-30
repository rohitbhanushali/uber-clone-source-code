import React, { useState, useEffect } from "react";
import tw from "tailwind-styled-components";
import Link from "next/link";

export default function Search() {
    const [pickup, setPickup] = useState("");
    const [dropoff, setDropoff] = useState("");
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [selectedDropoff, setSelectedDropoff] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
            setError('Mapbox token is missing. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file');
        }
    }, []);

    const searchLocation = async (query) => {
        if (!query) return [];
        if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
            setError('Mapbox token is missing');
            return [];
        }
        
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
                new URLSearchParams({
                    access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
                    limit: 5,
                    types: 'place,address,poi'
                })
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.features || [];
        } catch (error) {
            console.error('Error searching location:', error);
            setError('Error searching location. Please try again.');
            return [];
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (pickup && !selectedPickup) {
                const results = await searchLocation(pickup);
                setPickupSuggestions(results);
            } else {
                setPickupSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [pickup, selectedPickup]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (dropoff && !selectedDropoff) {
                const results = await searchLocation(dropoff);
                setDropoffSuggestions(results);
            } else {
                setDropoffSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [dropoff, selectedDropoff]);

    const handleSuggestionClick = (suggestion, isPickup) => {
        if (isPickup) {
            setPickup(suggestion.place_name);
            setSelectedPickup(suggestion);
            setPickupSuggestions([]);
        } else {
            setDropoff(suggestion.place_name);
            setSelectedDropoff(suggestion);
            setDropoffSuggestions([]);
        }
    };

    const handleInputChange = (value, isPickup) => {
        if (isPickup) {
            setPickup(value);
            setSelectedPickup(null);
        } else {
            setDropoff(value);
            setSelectedDropoff(null);
        }
    };

    return (
        <Wrapper>
            {error && (
                <ErrorContainer>
                    <ErrorMessage>{error}</ErrorMessage>
                </ErrorContainer>
            )}
            <ButtonContainer>
                <Link href="/">
                    <BackButton src="https://img.icons8.com/ios-filled/50/000000/left.png" />
                </Link>
            </ButtonContainer>

            <InputContainer>
                <FromToIcons>
                    <Circle src="https://img.icons8.com/ios-filled/50/9CA3AF/filled-circle.png" />
                    <Line src="https://img.icons8.com/ios/50/9CA3AF/vertical-line.png" />
                    <Square src="https://img.icons8.com/windows/50/000000/square-full.png" />
                </FromToIcons>

                <InputBoxes>
                    <InputWrapper>
                        <Input
                            placeholder="Enter pickup location"
                            value={pickup}
                            onChange={e => handleInputChange(e.target.value, true)}
                        />
                        {pickupSuggestions.length > 0 && (
                            <SuggestionsList>
                                {pickupSuggestions.map((suggestion, index) => (
                                    <SuggestionItem
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion, true)}
                                    >
                                        {suggestion.place_name}
                                    </SuggestionItem>
                                ))}
                            </SuggestionsList>
                        )}
                    </InputWrapper>
                    <InputWrapper>
                        <Input
                            placeholder="Where to?"
                            value={dropoff}
                            onChange={e => handleInputChange(e.target.value, false)}
                        />
                        {dropoffSuggestions.length > 0 && (
                            <SuggestionsList>
                                {dropoffSuggestions.map((suggestion, index) => (
                                    <SuggestionItem
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion, false)}
                                    >
                                        {suggestion.place_name}
                                    </SuggestionItem>
                                ))}
                            </SuggestionsList>
                        )}
                    </InputWrapper>
                </InputBoxes>
                <PlusIcon src="https://img.icons8.com/ios/50/000000/plus-math.png" />
            </InputContainer>

            <SavedPlaces>
                <StarIcon src="https://img.icons8.com/ios-filled/50/ffffff/star--v1.png" />
                Saved Places
            </SavedPlaces>

            <Link
                href={{
                    pathname: "/confirm",
                    query: {
                        pickup: selectedPickup ? selectedPickup.place_name : pickup,
                        dropoff: selectedDropoff ? selectedDropoff.place_name : dropoff
                    }
                }}
            >
                <ConfirmButton>Confirm Locations</ConfirmButton>
            </Link>
        </Wrapper>
    )
}

const Wrapper = tw.div`
    bg-gray-200 h-screen
`;

const ButtonContainer = tw.div`
    bg-white px-4
`;

const BackButton = tw.img`
    h-10 cursor-pointer
`;

const InputContainer = tw.div`
    bg-white flex items-center px-4 mb-2
`;

const FromToIcons = tw.div`
    w-10 flex flex-col mr-2 items-center
`;

const Circle = tw.img`
    h-2.5
`;

const Line = tw.img`
    h-10
`;

const Square = tw.img`
    h-3
`;

const InputBoxes = tw.div`
    flex flex-col flex-1
`;

const InputWrapper = tw.div`
    relative
`;

const Input = tw.input`
    h-10 bg-gray-200 my-2 rounded-2 p-2 outline-none border-none w-full
`;

const SuggestionsList = tw.div`
    absolute z-10 bg-white w-full shadow-lg rounded-lg mt-1 max-h-60 overflow-y-auto
`;

const SuggestionItem = tw.div`
    p-2 hover:bg-gray-100 cursor-pointer
`;

const PlusIcon = tw.img`
    h-10 w-10 bg-gray-200 rounded-full ml-3
`;

const SavedPlaces = tw.div`
    flex items-center justify-center bg-white px-4 py-2
`;

const StarIcon = tw.img`
    bg-gray-400 h-10 w-10 p-2 mr-2 rounded-full
`;

const ConfirmButton = tw.div`
    bg-black text-white text-center mt-4 mx-4 px-3 py-3 text-lg rounded-lg cursor-pointer hover:bg-gray-900 transition
`;

const ErrorContainer = tw.div`
    bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4
`;

const ErrorMessage = tw.p`
    text-sm
`;