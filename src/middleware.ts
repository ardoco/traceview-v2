import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';

// the middleware will run for any request to /api/*
export const config = {
    matcher: '/api/:path*',
};

export function middleware(request: NextRequest) {
    const targetApiUrlString = request.headers.get('X-Target-API');

    if (!targetApiUrlString) {
        return new Response('X-Target-API header is missing.', {status: 400});
    }

    let targetUrl;
    try {
        targetUrl = new URL(targetApiUrlString);
    } catch (_) {
        return new Response('Invalid URL format in X-Target-API header.', {status: 400});
    }

    if (targetUrl.protocol !== 'https:' && targetUrl.protocol !== 'http:') {
        return new Response('Only HTTP/S targets are allowed.', {status: 403});
    }

    // Construct the full destination URL
    const destination = `${targetUrl.origin}/api/${request.nextUrl.pathname.replace('/api/', '')}`;

    return NextResponse.rewrite(destination, {
        request: {
            headers: request.headers,
        },
    });
}