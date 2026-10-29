import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 px-6 py-24 font-sans flex items-center justify-center">
      <div className="max-w-[560px] w-full text-center space-y-6">
        <h1 className="text-3xl font-medium tracking-tight text-zinc-900">
          Zomato Lite
        </h1>
        <p className="text-sm text-zinc-500">
          A minimalist restaurant review system built with Next.js, raw SQL, and Neon Postgres.
        </p>
        <div>
          <Link
            href="/restaurant/1"
            className="inline-block bg-zinc-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Open Ludhiana Burrito (/restaurant/1)
          </Link>
        </div>
      </div>
    </main>
  );
}
