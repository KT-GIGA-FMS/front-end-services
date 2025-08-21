import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_CAR_BASE_URL;   // e.g. https://<apim>.azure-api.net
  const key  = process.env.APIM_SUBSCRIPTION_KEY;      // 서버 비밀
  const resp = await fetch(`${base}/car-service/v1/cars`, {
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Accept': 'application/json'
    },
    cache: 'no-store'
  });

  const data = await resp.json();
  return NextResponse.json(data, { status: resp.status });
}

export async function POST(req) {
  const base = process.env.NEXT_PUBLIC_CAR_BASE_URL;
  const key  = process.env.APIM_SUBSCRIPTION_KEY;
  const body = await req.json();

  const resp = await fetch(`${base}/car-service/v1/cars`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await resp.json();
  return NextResponse.json(data, { status: resp.status });
}
