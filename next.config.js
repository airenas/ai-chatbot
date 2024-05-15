/** @type {import('next').NextConfig} */
module.exports = {
  // output: 'export',
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  basePath: '/ai-chatbot',
}
