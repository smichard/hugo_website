FROM klakegg/hugo:0.104.3-onbuild AS hugo

FROM nginx
COPY --from=hugo /target /usr/share/nginx/html

#FROM joseluisq/static-web-server:2
#COPY --from=hugo /target/ /public