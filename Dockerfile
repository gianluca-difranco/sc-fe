# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# Copia i file dei pacchetti e installa
COPY package*.json ./
RUN npm install

# Copia il resto del codice
COPY . .

# Passa la variabile d'ambiente durante la build (necessario per React)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Genera la build statica
RUN npm run build

# Stage 2: Serve con Nginx
FROM nginx:stable-alpine
# Copia la tua configurazione personalizzata
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia la build di React
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]