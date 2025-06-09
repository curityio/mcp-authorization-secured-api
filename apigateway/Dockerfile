FROM kong:3.9-ubuntu
USER root
RUN apt-get update && apt-get install curl
RUN git config --global url."https://".insteadOf git:// && \
    git config --global advice.detachedHead false && \
    luarocks install kong-phantom-token 2.0.1
USER kong
