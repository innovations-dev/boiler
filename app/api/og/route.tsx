import { ImageResponse } from 'next/og';

import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic params
    const title = searchParams.get('title') ?? 'Default Title';
    const description =
      searchParams.get('description') ?? 'Default Description';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            padding: '40px 80px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              fontWeight: 'bold',
              color: '#000',
              marginBottom: 20,
              textAlign: 'center',
              whiteSpace: 'pre-wrap',
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: '#666',
              textAlign: 'center',
              whiteSpace: 'pre-wrap',
            }}
          >
            {description}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    logger.error(
      'Error generating OG image',
      {
        component: 'OGImage',
        path: 'api/og',
        url: request.url,
      },
      error
    );
    return new Response('Error generating OG image', { status: 500 });
  }
}
