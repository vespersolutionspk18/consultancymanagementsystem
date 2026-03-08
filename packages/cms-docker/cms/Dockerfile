# Base image for common dependencies
FROM node:24-alpine AS common-deps

WORKDIR /app

# Copy only the necessary files for dependency resolution
COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches

COPY ./.prettierrc /app/
COPY ./packages/cms-emails/package.json /app/packages/cms-emails/
COPY ./packages/cms-server/package.json /app/packages/cms-server/
COPY ./packages/cms-server/patches /app/packages/cms-server/patches
COPY ./packages/cms-ui/package.json /app/packages/cms-ui/
COPY ./packages/cms-shared/package.json /app/packages/cms-shared/
COPY ./packages/cms-front/package.json /app/packages/cms-front/

# Install all dependencies
RUN yarn && yarn cache clean && npx nx reset


# Build the back
FROM common-deps AS cms-server-build

# Copy sourcecode after installing dependences to accelerate subsequents builds
COPY ./packages/cms-emails /app/packages/cms-emails
COPY ./packages/cms-shared /app/packages/cms-shared
COPY ./packages/cms-server /app/packages/cms-server

RUN npx nx run cms-server:build

RUN yarn workspaces focus --production cms-emails cms-shared cms-server

# Build the front
FROM common-deps AS cms-front-build

ARG REACT_APP_SERVER_BASE_URL

COPY ./packages/cms-front /app/packages/cms-front
COPY ./packages/cms-ui /app/packages/cms-ui
COPY ./packages/cms-shared /app/packages/cms-shared
RUN npx nx build cms-front


# Final stage: Run the application
FROM node:24-alpine AS cms

# Used to run healthcheck in docker
RUN apk add --no-cache curl jq

RUN npm install -g tsx

RUN apk add --no-cache postgresql-client

COPY ./packages/cms-docker/cms/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
WORKDIR /app/packages/cms-server

ARG REACT_APP_SERVER_BASE_URL
ENV REACT_APP_SERVER_BASE_URL=$REACT_APP_SERVER_BASE_URL

ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION

# Copy built applications from previous stages
COPY --chown=1000 --from=cms-server-build /app /app
COPY --chown=1000 --from=cms-server-build /app/packages/cms-server /app/packages/cms-server
COPY --chown=1000 --from=cms-front-build /app/packages/cms-front/build /app/packages/cms-server/dist/front

# Set metadata and labels
LABEL org.opencontainers.image.source=https://github.com/cmshq/cms
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend and frontend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

RUN mkdir -p /app/.local-storage /app/packages/cms-server/.local-storage && \
    chown -R 1000:1000 /app

# Use non root user with uid 1000
USER 1000

CMD ["node", "dist/main"]
ENTRYPOINT ["/app/entrypoint.sh"]
