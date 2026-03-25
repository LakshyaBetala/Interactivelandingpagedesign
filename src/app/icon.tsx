import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
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
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FF5A1F',
          borderRadius: '8px',
          border: '2px solid #0D0D0D',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#0D0D0D',
            borderRadius: '2px',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
