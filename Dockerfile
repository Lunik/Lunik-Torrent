FROM lunik/node-alpine-onbuild:onbuild

RUN npm run postinstall

VOLUME ["/usr/src/app/configs", "/usr/src/app/files"]
EXPOSE 8080
