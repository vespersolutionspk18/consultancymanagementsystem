<div align="center">
  <a href="https://cms.com">
    <picture>
      <img alt="CMS logo" src="https://raw.githubusercontent.com/cmshq/cms/2f25922f4cd5bd61e1427c57c4f8ea224e1d552c/packages/cms-website/public/images/core/logo.svg" height="128">
    </picture>
  </a>
  <h1>Create CMS App</h1>

<a href="https://www.npmjs.com/package/create-cms-app"><img alt="NPM version" src="https://img.shields.io/npm/v/create-cms-app.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://github.com/cmshq/cms/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/cx5n4Jzs57"><img alt="Join the community on Discord" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&logo=CMS&labelColor=000000&logoWidth=20"></a>

</div>

Create CMS App is the official scaffolding CLI for building apps on top of [CMS CRM](https://cms.com). It sets up a ready‑to‑run project that works seamlessly with the [cms-sdk](https://www.npmjs.com/package/cms-sdk).

- Zero‑config project bootstrap
- Preconfigured scripts for auth, generate, dev sync, one‑off sync, uninstall
- Strong TypeScript support and typed client generation

## Prerequisites
- Node.js 24+ (recommended) and Yarn 4
- A CMS workspace and an API key (create one at https://app.cms.com/settings/api-webhooks)

## Quick start

```bash
npx create-cms-app@latest my-cms-app
cd my-cms-app

# Authenticate using your API key (you'll be prompted)
yarn auth

# Add a new entity to your application (guided)
yarn create-entity

# Generate a typed CMS client and workspace entity types
yarn generate

# Start dev mode: automatically syncs local changes to your workspace
yarn dev

# Or run a one‑time sync
yarn sync

# Watch your application's functions logs
yarn logs

# Uninstall the application from the current workspace
yarn uninstall

# Display commands' help
yarn help
```

## What gets scaffolded
- A minimal app structure ready for CMS
- TypeScript configuration
- Prewired scripts that wrap the `cms` CLI from cms-sdk
- Example placeholders to help you add entities, actions, and sync logic

## Next steps
- Explore the generated project and add your first entity with `yarn create-entity`.
- Keep your types up‑to‑date using `yarn generate`.
- Use `yarn dev` while you iterate to see changes instantly in your workspace.


## Publish your application
Applications are currently stored in `cms/packages/cms-apps`.

You can share your application with all CMS users:

```bash
# pull the CMS project
git clone https://github.com/cmshq/cms.git
cd cms

# create a new branch
git checkout -b feature/my-awesome-app
```

- Copy your app folder into `cms/packages/cms-apps`.
- Commit your changes and open a pull request on https://github.com/cmshq/cms

```bash
git commit -m "Add new application"
git push
```

Our team reviews contributions for quality, security, and reusability before merging.

## Troubleshooting
- Auth prompts not appearing: run `yarn auth` again and verify the API key permissions.
- Types not generated: ensure `yarn generate` runs without errors, then re‑start `yarn dev`.

## Contributing
- See our [GitHub](https://github.com/cmshq/cms)
- Join our [Discord](https://discord.gg/cx5n4Jzs57)
