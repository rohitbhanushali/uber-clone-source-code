import React, { useEffect, useState } from "react";
import tw from "tailwind-styled-components";
import { carList } from "./data/data";

export default function RideSelector({ pickup, dropoff }) {
    const [rideDuration, setRideDuration] = useState(0);

    useEffect(() => {
        if (!pickup || !dropoff) return;

        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${pickup[0]},${pickup[1]};${dropoff[0]},${dropoff[1]}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
          .then(res => res.json())
          .then(data => {
            console.log("Directions API Response:", data);
            if (data.routes && data.routes.length > 0) {
              setRideDuration(data.routes[0].duration / 60); // Convert to minutes
            } else {
              console.warn("No routes found");
              setRideDuration(0);
            }
          })
          .catch(error => {
            console.error("Error fetching directions:", error);
            setRideDuration(0);
          });
    }, [pickup, dropoff]);

    return (
        <Wrapper>
            <Title>Choose a ride, or swipe up for more</Title>
            <CarList>
            {carList.map((car, index) => (
                <Car key={index}>
                <CarImage src={car.imgUrl}></CarImage>
                <CarDetails>
                    <Service>{car.service}</Service>
                    <Time>5 min away</Time>
                </CarDetails>
                <Price>{'$'+(rideDuration*car.multiplier).toFixed(2)}</Price>
                </Car>
            ))}
            </CarList>
        </Wrapper>
    )
}

const Time = tw.div`
text-xs text-blue-500
`;

const Service = tw.div`
font-medium
`;

const Car = tw.div`
flex p-4 items-center 
`;

const CarImage = tw.img`
h-14 mr-4
`;

const CarDetails = tw.div`
flex-1
`;

const Price = tw.div`
text-sm
`;

const CarList = tw.div`
overflow-y-scroll
`;

const Title = tw.div`
text-gray-500 text-center text-xs py-2 border-b
`;

const Wrapper = tw.div`
flex-1 overflow-y-scroll flex flex-col
`;