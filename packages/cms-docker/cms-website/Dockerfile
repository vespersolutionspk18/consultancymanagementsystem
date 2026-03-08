FROM node:24-alpine AS cms-website-build


WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .
COPY ./.yarnrc.yml .
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches
COPY ./tools/eslint-rules /app/tools/eslint-rules
COPY ./packages/cms-ui/package.json /app/packages/cms-ui/
COPY ./packages/cms-shared/package.json /app/packages/cms-shared/
COPY ./packages/cms-website/package.json /app/packages/cms-website/package.json

RUN yarn

ENV KEYSTATIC_GITHUB_CLIENT_ID="<fake build value>"
ENV KEYSTATIC_GITHUB_CLIENT_SECRET="<fake build value>"
ENV KEYSTATIC_SECRET="<fake build value>"
ENV NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG="<fake build value>"

COPY ./packages/cms-ui /app/packages/cms-ui
COPY ./packages/cms-website /app/packages/cms-website
RUN npx nx build cms-website

FROM node:24-alpine AS cms-website

WORKDIR /app/packages/cms-website

COPY --from=cms-website-build /app /app

WORKDIR /app/packages/cms-website

LABEL org.opencontainers.image.source=https://github.com/cmshq/cms
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the website."

RUN chown -R 1000 /app

# Use non root user with uid 1000
USER 1000

CMD ["/bin/sh", "-c", "npx nx start"]