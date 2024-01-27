FROM klakegg/hugo:0.111.3-ext-alpine-onbuild AS hugo

FROM quay.io/michard/nginx_base_image:0.2.8
COPY --from=hugo /target /usr/share/nginx/html