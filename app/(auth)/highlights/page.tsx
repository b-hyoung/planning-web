import { prisma } from "@/lib/db";
import { HighlightsClient, type HighlightItem } from "./HighlightsClient";

interface Props {
  searchParams: Promise<{ author?: string }>;
}

export default async function HighlightsPage({ searchParams }: Props) {
  const params = await searchParams;
  const authorFilter = params.author ?? null;

  const where = authorFilter ? { author: authorFilter } : {};

  const rows = await prisma.highlight.findMany({
    where,
    orderBy: [{ postedAt: "desc" }, { fetchedAt: "desc" }],
    take: 500,
  });

  const authors = await prisma.highlight.findMany({
    distinct: ["author"],
    select: { author: true },
  });

  const items: HighlightItem[] = rows.map((r) => ({
    id: r.id,
    sourceUrl: r.sourceUrl,
    author: r.author,
    text: r.text,
    comments: JSON.parse(r.comments ?? "[]") as string[],
    summary: r.summary,
    tags: JSON.parse(r.tags ?? "[]") as string[],
    postedAtIso: r.postedAt ? r.postedAt.toISOString() : null,
    fetchedAtIso: r.fetchedAt.toISOString(),
  }));

  return (
    <HighlightsClient
      items={items}
      authors={authors.map((a) => a.author)}
      activeAuthor={authorFilter}
    />
  );
}
