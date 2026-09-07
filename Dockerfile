# syntax=docker/dockerfile:1
FROM oven/bun:1-alpine

WORKDIR /app

# Copy lockfile and config before install for better layer caching
# Copy only manifests first for better layer cache
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# Pre-install to populate the image layer (used as fallback cache seed)
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5173

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
# entrypoint re-runs bun install at startup so bind-mounted source always has
# node_modules, using the named bun_cache volume for near-instant cache hits.
ENTRYPOINT ["/entrypoint.sh"]
