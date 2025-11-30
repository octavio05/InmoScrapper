# Raspeberry execution

Raspberry don't accept --env-file option so you need to work with unique .env file, not .env.development or .env.production.

## Docker execution

1. Set values to .env file vars.
2. Build the docker image.

```bash
docker compose build
```

3. Run the docker container.

```bash
# Run docker container
docker compose up -d -V

# Run docker container with logs
docker compose up -d -V && docker compose logs -f
```
