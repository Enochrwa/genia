# Build from the repository root:  docker build -f backend/api/Dockerfile -t genia-api .
FROM node:22-slim AS build
WORKDIR /repo
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY common ./common
COPY backend ./backend
RUN pnpm install --frozen-lockfile --filter "@genia/api..."
RUN pnpm --filter @genia/api build
RUN pnpm --filter @genia/api deploy --prod /out

FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /repo/backend/api/dist ./dist
COPY --from=build /repo/backend/api/scripts ./scripts
COPY --from=build /repo/backend/api/src/database/migrations ./src/database/migrations
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.cjs"]
