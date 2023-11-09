FROM nginx:latest
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates curl gnupg
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
ENV NODE_MAJOR 20
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install nodejs -y
COPY . .
RUN npm install
RUN npm run build:prod
RUN cp -rf dist/frontend-tdg/* /usr/share/nginx/html
EXPOSE 4200
CMD [ "nginx","-g","daemon off;"]