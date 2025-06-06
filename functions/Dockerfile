# 1. Usa una imagen base liviana de Node.js
FROM node:20-slim

# 2. Instala Chromium y dependencias necesarias
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 3. Configura Puppeteer para usar Chromium del sistema
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 4. Establece el directorio de trabajo y copia el código
WORKDIR /usr/src/app
COPY . .

# 5. Instala dependencias
RUN npm install

# 6. Expone el puerto 8080 (el default en Cloud Run)
EXPOSE 8080

# 7. Arranca tu app (ajusta el comando según tu start script)
CMD ["npm", "start"]
