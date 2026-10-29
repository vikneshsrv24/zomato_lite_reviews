import { Suspense } from 'react';
import Link from 'next/link';

export const instant = false;

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RestaurantData {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
}

async function getRestaurant(id: string): Promise<RestaurantData | null> {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/restaurants/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch restaurant');
    }

    return res.json();
  } catch (err) {
    console.error('Failed to load restaurant data:', err);
    return null;
  }
}

function RestaurantContent({ id, data }: { id: string; data: RestaurantData }) {
  return (
    <main className="min-h-screen bg-[#fcfaf7] text-zinc-900 px-6 py-16 font-sans relative overflow-hidden">
      {/* Warm food-themed background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-100/30 blur-3xl pointer-events-none" />

      <div className="max-w-[560px] mx-auto space-y-8 relative z-10">
        
        {/* Header: Restaurant name, cuisine, area */}
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-900">
            {data.name}
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            {data.cuisine} · {data.area}
          </p>
        </div>

        {/* Rating Section: Average rating large, count next to it */}
        <div className="flex items-baseline gap-3 pb-6 border-b border-zinc-200">
          <div className="text-5xl font-semibold tracking-tight text-zinc-900">
            {data.averageRating !== null ? data.averageRating : '—'}
          </div>
          <div className="text-sm text-zinc-500">
            {data.totalReviews} {data.totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Action Link to Write Review */}
        <div>
          <Link
            href={`/review/${id}`}
            className="inline-block bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Write a review
          </Link>
        </div>

        {/* Reviews Section */}
        {data.totalReviews === 0 ? (
          <div className="py-12 text-center border border-dashed border-zinc-300 rounded-lg bg-white/50">
            <p className="text-sm text-zinc-500 mb-3">No reviews yet for this restaurant.</p>
            <Link
              href={`/review/${id}`}
              className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
            >
              Be the first to leave one
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Latest Review (Visually highlighted) */}
            {data.latestReview && (
              <div className="bg-white/90 backdrop-blur border border-amber-200/60 rounded-lg p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-amber-800">
                    Latest review
                  </span>
                  <span className="text-sm font-medium text-zinc-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {data.latestReview.rating}★
                  </span>
                </div>
                <p className="text-sm text-zinc-800">{data.latestReview.comment}</p>
                <p className="text-xs text-zinc-400">
                  {new Date(data.latestReview.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Older Reviews List */}
            {data.reviews.length > 0 && (
              <div className="space-y-4 pt-2">
                <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Older reviews
                </h2>
                <div className="space-y-3">
                  {data.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white/80 border border-zinc-200/80 rounded-lg p-4 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-900">
                          {review.rating}★
                        </span>
                        <span className="text-xs text-zinc-400">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}

export default async function RestaurantPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const data = await getRestaurant(id);

  const content = !data ? (
    <main className="min-h-screen bg-[#fcfaf7] text-zinc-900 px-6 py-16 font-sans relative overflow-hidden">
      <div className="max-w-[560px] mx-auto relative z-10">
        <div className="py-12 text-center">
          <p className="text-sm text-zinc-500 mb-3">Restaurant not found.</p>
          <Link href="/" className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600">
            Go home
          </Link>
        </div>
      </div>
    </main>
  ) : (
    <RestaurantContent id={id} data={data} />
  );

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fcfaf7] text-zinc-900 px-6 py-16 font-sans relative overflow-hidden">
          <div className="max-w-[560px] mx-auto relative z-10">
            <p className="text-sm text-zinc-500">Loading...</p>
          </div>
        </main>
      }
    >
      {content}
    </Suspense>
  );
}
