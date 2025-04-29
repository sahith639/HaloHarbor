FROM node:latest

WORKDIR /app

# Copy package.json and lock file if available
COPY package*.json ./

# Install dependencies (lucide-react and jwt-decode should already be in package.json)
RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
