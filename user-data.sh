#!/bin/bash

cd /home/ubuntu
git clone https://github.com/rohitbhanushali/uber-clone-source-code.git
cd uber-clone-source-code

# Create .env file with required environment variables
cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCxcJPzA_M9gH6PvkbOyEHXSGmPCG7GiZM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=uber-clone-a66fe.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=uber-clone-a66fe
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=uber-clone-a66fe.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=25663664732
NEXT_PUBLIC_FIREBASE_APP_ID=1:25663664732:web:499fb47e45009a06fd6c99
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-QJMPNW8HKR
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiaWFuMDM4IiwiYSI6ImNrejRkdWVscDBmZzgyb28yOGVjazFkaWMifQ.rpr-o9cBKiJ2PGh8K8VzXA
EOF

# Update system packages
sudo apt update

# Install required packages
sudo apt install nodejs npm -y

# Install project dependencies
npm install
npm audit fix --force

# Start dev server (backgrounded for now)
npm run dev &
