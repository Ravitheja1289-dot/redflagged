import { ImageResponse } from 'next/og';


export const alt = 'RedFlaggers — Recognize the red flags';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#0a0b0e',
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(229, 57, 53, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 40%)',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#E53935',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '22px',
            }}
          >
            ⚑
          </div>
          <div
            style={{
              display: 'flex',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(229, 57, 53, 0.12)',
              border: '1px solid rgba(229, 57, 53, 0.25)',
              color: '#ff6b6b',
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Community Safety & Pattern Awareness
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#E53935' }}>Red</span>
            <span>Flaggers</span>
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 600,
              color: '#f1f5f9',
              lineHeight: 1.2,
            }}
          >
            Recognize the red flags.
          </div>
          <div
            style={{
              fontSize: '22px',
              color: '#94a3b8',
              maxWidth: '850px',
              lineHeight: 1.4,
            }}
          >
            Anonymous experiences. Recognizable patterns. Read, share, and recognize warning signs of toxic behavior, harassment, and misconduct.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#64748b',
            fontSize: '16px',
          }}
        >
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>Anonymous</span>
            <span>•</span>
            <span>Community-Driven</span>
            <span>•</span>
            <span>Zero Tracking</span>
          </div>
          <div style={{ color: '#cbd5e1', fontWeight: 500 }}>
            redflaggers.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
