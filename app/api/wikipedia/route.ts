import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 });
  }

  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    const searchData = (await searchRes.json()) as {
      query?: { search?: { title: string }[] };
    };

    const firstResult = searchData.query?.search?.[0];
    if (!firstResult) {
      return NextResponse.json({ error: "No Wikipedia article found" }, { status: 404 });
    }

    const title = encodeURIComponent(firstResult.title.replace(/ /g, "_"));
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { headers: { "User-Agent": "BiodiversityHub/1.0" } }
    );

    if (!summaryRes.ok) {
      return NextResponse.json({ error: "No Wikipedia article found" }, { status: 404 });
    }

    const summary = (await summaryRes.json()) as {
      extract?: string;
      thumbnail?: { source?: string };
    };

    return NextResponse.json({
      description: summary.extract ?? null,
      image: summary.thumbnail?.source ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch Wikipedia data" }, { status: 500 });
  }
}
