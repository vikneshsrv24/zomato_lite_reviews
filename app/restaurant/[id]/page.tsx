import Link from 'next/link';
import { notFound } from 'next/navigation';

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
    // In Next.js App Router, fetch during SSR can use absolute URL or relative URL if supported.
    // To be 100% robust on Vercel and locally, we can construct the base URL or fetch directly.
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

export default async function RestaurantPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const data = await getRestaurant(id);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 px-6 py-16 font-sans">
      <div className="max-w-[560px] mx-auto space-y-8">
        
        {/* Header: Restaurant name, cuisine, area */}
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-900">
            {data.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
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
            className="inline-block bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Write a review
          </Link>
        </div>

        {/* Reviews Section */}
        {data.totalReviews === 0 ? (
          <div className="py-12 text-center border border-dashed border-zinc-200 rounded-lg">
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
              <div className="bg-white border border-zinc-300 rounded-lg p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Latest review
                  </span>
                  <span className="text-sm font-medium text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
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
                      className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2"
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
