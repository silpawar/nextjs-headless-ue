import { NextResponse } from 'next/server';
import { fetchExperienceFragment } from '@/app/lib/aem-client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
        return NextResponse.json(
            { error: 'Missing required query parameter: path' },
            { status: 400 }
        );
    }

    const isAllowedPath =
        path.startsWith('/content/experience-fragments/') &&
        !path.includes('://');

    if (!isAllowedPath) {
        return NextResponse.json(
            {
                error:
                    'Invalid path. Only /content/experience-fragments/* paths are allowed.',
            },
            { status: 400 }
        );
    }

    try {
        const html = await fetchExperienceFragment(path);
        return new NextResponse(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch Experience Fragment', details: message },
            { status: 500 }
        );
    }
}
