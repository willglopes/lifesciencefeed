# root of frontend/nextjs
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# install all deps for development
RUN npm install
COPY . .
# run dev server with hot reload (no flags)
CMD ["npm","run","dev"]