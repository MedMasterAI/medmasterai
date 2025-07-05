FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json tsconfig.json ./
RUN npm install
COPY dist ./dist 
# Copy source files and build
COPY . .
RUN npm run build && npm prune --production

EXPOSE 8080

CMD ["node", "dist/index.js"]
