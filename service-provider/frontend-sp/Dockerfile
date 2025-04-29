FROM node:latest

# Set working directory
WORKDIR /app

# Copy only package.json and install dependencies
COPY package.json ./
RUN npm install && npm install lucide-react react-icons

# Copy the rest of your application
COPY . .

# Expose port if needed (optional)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
