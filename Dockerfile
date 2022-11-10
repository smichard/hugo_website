FROM klakegg/hugo:0.105.0-ubuntu-onbuild AS hugo

FROM nginx:alpine
COPY --from=hugo /target /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf