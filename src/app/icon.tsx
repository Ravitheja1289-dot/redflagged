import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: '#0d0f12',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E53935',
          borderRadius: 6,
          fontWeight: 800,
        }}
      >
        ⚑
      </div>
    ),
    {
      ...size,
    }
  );
}
