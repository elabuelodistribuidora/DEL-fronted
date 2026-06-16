/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // S3 / CloudFront (producción)
      { protocol: 'https', hostname: 'cdn.distribuidoraelabuelo.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      // Imágenes demo de productos (loremflickr → fotos CC temáticas)
      { protocol: 'https', hostname: 'loremflickr.com' },
      { protocol: 'https', hostname: '**.staticflickr.com' },
      // Por si más adelante usamos Unsplash/Picsum
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
}

export default nextConfig
