import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RedFlaggers — Recognize the red flags',
    short_name: 'RedFlaggers',
    description:
      'Anonymous experiences. Recognizable patterns. Read and share warnings of toxic behavior and harassment.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0f12',
    theme_color: '#E53935',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
