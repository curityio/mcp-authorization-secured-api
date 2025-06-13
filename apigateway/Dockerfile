FROM kong:3.9-ubuntu

USER root
RUN apt-get update && apt-get install -y git unzip curl

#
# Copy in the phantom token plugin
#
COPY phantom-token /usr/local/share/lua/5.1/kong/plugins/phantom-token

#
# Install libraries it depends upon
#
RUN git config --global url."https://".insteadOf git:// && \
    git config --global advice.detachedHead false && \
    luarocks install lua-resty-http && \
    luarocks install lua-resty-jwt
    
USER kong
