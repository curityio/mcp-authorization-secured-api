FROM node:22-bookworm-slim

RUN groupadd --gid 10000 metadatauser \
  && useradd --uid 10001 --gid metadatauser --shell /bin/bash --create-home metadatauser

WORKDIR /usr/metadata
COPY --chown=10001:10000 package*.json index.mjs /usr/metadata/
RUN npm install --omit=dev
USER 10001
  
CMD ["node", "index.mjs"]
