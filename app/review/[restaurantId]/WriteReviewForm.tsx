'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WriteReviewForm({ restaurantId }: { restaurantId: string }) {
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
      <main className="min-h-screen bg-[#fcfaf7] text-zinc-900 px-6 py-16 flex items-center justify-center font-sans">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfaf7] text-zinc-900 px-6 py-16 font-sans relative overflow-hidden">
      {/* Warm food-themed background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-100/30 blur-3xl pointer-events-none" />

      <div className="max-w-[560px] mx-auto relative z-10">
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

        <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur border border-zinc-200/80 p-6 rounded-xl shadow-sm">
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
                      ? 'bg-amber-800 text-white border-amber-800'
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
              placeholder="How was the naatukozhi fry or biryani?"
              className="w-full rounded-lg border border-zinc-200 p-3 text-zinc-900 bg-white focus:outline-none focus:border-amber-800 transition-colors text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || submitting}
            className={`w-full py-3 rounded-lg text-sm font-medium transition-colors shadow-sm ${
              isValid && !submitting
                ? 'bg-amber-800 text-white hover:bg-amber-900'
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
