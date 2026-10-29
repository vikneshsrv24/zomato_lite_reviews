'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WriteReviewPage(props: { params: Promise<{ restaurantId: string }> }) {
  const params = use(props.params);
  const restaurantId = params.restaurantId;
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState<string>('Restaurant');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Restaurant not found');
        return res.json();
      })
      .then((data) => {
        setRestaurantName(data.name);
        setLoading(false);
      })
      .catch(() => {
        setRestaurantName('Restaurant');
        setLoading(false);
      });
  }, [restaurantId]);

  const isValid = rating >= 1 && rating <= 5 && comment.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      // Success: send user to restaurant page
      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] text-zinc-900 px-6 py-16 flex items-center justify-center font-sans">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 px-6 py-16 font-sans">
      <div className="max-w-[560px] mx-auto">
        <div className="mb-8">
          <Link
            href={`/restaurant/${restaurantId}`}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← Back to restaurant
          </Link>
          <h1 className="text-xl font-medium tracking-tight mt-3 text-zinc-900">
            Write a review for {restaurantName}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-12 h-12 rounded-lg border text-base font-medium transition-colors flex items-center justify-center ${
                    rating >= star
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {star}★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-zinc-700 mb-2"
            >
              Comment
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you order? How was it?"
              className="w-full rounded-lg border border-zinc-200 p-3 text-zinc-900 bg-white focus:outline-none focus:border-zinc-900 transition-colors text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || submitting}
            className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
              isValid && !submitting
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </form>
      </div>
    </main>
  );
}
