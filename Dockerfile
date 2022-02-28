FROM node:14.18.3
RUN apt-get update && apt-get install -y \
  nano \
  vim