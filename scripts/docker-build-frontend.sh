#!/usr/bin/env bash
set -euo pipefail

./scripts/container-cli.sh build -f frontend/Dockerfile frontend
