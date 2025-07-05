FROM node:20-slim AS build

WORKDIR /app

# Install all dependencies and build the TypeScript source
COPY package*.json tsconfig.json ./
ENV NODE_ENV=development
RUN npm install
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built application from the previous stage
COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]
