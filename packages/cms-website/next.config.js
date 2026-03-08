/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/user-guide',
        destination: 'https://docs.cms.com/user-guide/introduction',
        permanent: true,
      },
      {
        source: '/user-guide/section/:folder/:slug*',
        destination: 'https://docs.cms.com/user-guide/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/user-guide/:folder/:slug*',
        destination: 'https://docs.cms.com/user-guide/:folder/:slug*',
        permanent: true,
      },

      {
        source: '/developers',
        destination: 'https://docs.cms.com/developers/introduction',
        permanent: true,
      },
      {
        source: '/developers/section/:folder/:slug*',
        destination: 'https://docs.cms.com/developers/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/developers/:folder/:slug*',
        destination: 'https://docs.cms.com/developers/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/developers/:slug',
        destination: 'https://docs.cms.com/developers/:slug',
        permanent: true,
      },

      {
        source: '/cms-ui',
        destination: 'https://docs.cms.com/cms-ui/introduction',
        permanent: true,
      },
      {
        source: '/cms-ui/section/:folder/:slug*',
        destination: 'https://docs.cms.com/cms-ui/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/cms-ui/:folder/:slug*',
        destination: 'https://docs.cms.com/cms-ui/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/cms-ui/:slug',
        destination: 'https://docs.cms.com/cms-ui/:slug',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
