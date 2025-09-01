#!/bin/sh
# build script with multi-architecture support (linux/amd64 and linux/arm64)
set -ex

cd dockerfiles
tag=3007.6

# Setup buildx for multi-architecture builds
# Remove any existing problematic builder
docker buildx rm multiarch 2>/dev/null || true
# Create a fresh builder with multi-platform support
docker buildx create --name multiarch --driver docker-container --use || true
docker buildx inspect --bootstrap

# Build function for multi-architecture images
build_multiarch_image() {
  dockerfile="$1"
  imagename="$2"
  
  echo "Building $imagename for multiple architectures (linux/amd64,linux/arm64)"
  docker buildx build --platform linux/amd64,linux/arm64 \
    -f "$dockerfile" \
    -t "$imagename:$tag" \
    -t "$imagename:latest" \
    --push .
}

# Build all images with multi-architecture support
build_multiarch_image dockerfile-saltmaster "erwindon/saltgui-saltmaster"
build_multiarch_image dockerfile-saltmaster-tls "erwindon/saltgui-saltmaster-tls"
build_multiarch_image dockerfile-saltminion-ubuntu "erwindon/saltgui-saltminion-ubuntu"
build_multiarch_image dockerfile-saltminion-debian "erwindon/saltgui-saltminion-debian"
build_multiarch_image dockerfile-saltminion-centos "erwindon/saltgui-saltminion-centos"

# Cleanup containers and dangling images
docker container ls -aq | xargs --no-run-if-empty docker container rm --force
docker images | awk '/^<none>/ {print $3;}' | xargs --no-run-if-empty docker rmi

# Final cleanup
docker system prune --force --filter "until=12h"
docker images
# End
