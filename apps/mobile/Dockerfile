FROM ghcr.io/cirruslabs/flutter:stable AS builder

WORKDIR /workspace
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

COPY . ./
RUN flutter build web --release --dart-define=API_BASE_URL=

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/build/web /usr/share/nginx/html

EXPOSE 80
