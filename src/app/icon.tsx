import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${(await readFile(join(process.cwd(), 'public', 'almmatix_logo.png'))).toString('base64')}`}
          alt=""
          width="32"
          height="32"
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    { ...size }
  );
}
