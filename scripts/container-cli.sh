#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/container-cli.sh build -f <Dockerfile> <context>
  ./scripts/container-cli.sh compose <args...>
  ./scripts/container-cli.sh ps

Behavior:
- Auto-detects and uses first available engine: docker, podman, nerdctl.
- Prints guidance and exits cleanly if no container CLI is available.
USAGE
}

if [ "$#" -lt 1 ]; then
  usage
  exit 0
fi

ENGINE=""
for candidate in docker podman nerdctl; do
  if command -v "$candidate" >/dev/null 2>&1; then
    ENGINE="$candidate"
    break
  fi
done

if [ -z "$ENGINE" ]; then
  echo "[container-cli] No container CLI found (docker/podman/nerdctl)."
  echo "[container-cli] Install Docker Desktop/Engine, Podman, or nerdctl."
  echo "[container-cli] Example: ./scripts/container-cli.sh build -f frontend/Dockerfile frontend"
  exit 0
fi

echo "[container-cli] Using engine: $ENGINE"

cmd="$1"
shift
case "$cmd" in
  build)
    "$ENGINE" build "$@"
    ;;
  compose)
    if [ "$ENGINE" = "docker" ]; then
      "$ENGINE" compose "$@"
    elif [ "$ENGINE" = "podman" ] && command -v podman-compose >/dev/null 2>&1; then
      podman-compose "$@"
    else
      echo "[container-cli] Compose not available for engine '$ENGINE' in this environment."
      echo "[container-cli] For build-only operations, use: ./scripts/container-cli.sh build -f <Dockerfile> <context>"
      exit 0
    fi
    ;;
  ps)
    "$ENGINE" ps "$@"
    ;;
  *)
    usage
    exit 0
    ;;
esac
