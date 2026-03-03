# NEXUS SOC Command Center Setup

## Local Setup
1. `docker compose up --build`
2. Pull model: `docker exec -it $(docker ps -qf name=ollama) ollama pull mistral:7b`
3. Access frontend `http://localhost:3000`, backend docs `http://localhost:8000/docs`.

## Environment variables
- `SECRET_KEY`
- `REDIS_URL`
- `OLLAMA_URL`
- `OLLAMA_MODEL`
- `VIRUSTOTAL_API_KEY`
- `ABUSEIPDB_API_KEY`
- `OTX_API_KEY`

## Kubernetes
1. Build and push images (`nexus/backend`, `nexus/frontend`).
2. `kubectl apply -f k8s/nexus-soc.yaml`
3. Expose services using ingress/load balancer.


## Container build helper
Use this command to build the frontend image with either Docker, Podman, or nerdctl:

```bash
./scripts/container-cli.sh build -f frontend/Dockerfile frontend
```

If neither CLI exists in your sandbox, the helper prints instructions and exits cleanly.
