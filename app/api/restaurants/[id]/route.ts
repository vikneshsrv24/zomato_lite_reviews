import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const restaurantId = parseInt(params.id, 10);

    if (isNaN(restaurantId)) {
      return NextResponse.json({ error: 'Invalid restaurant ID.' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Check if restaurant exists
    const restaurants = await sql`
      SELECT id, name, cuisine, area 
      FROM restaurants 
      WHERE id = ${restaurantId}
    `;

    if (restaurants.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found.' }, { status: 404 });
    }

    const restaurant = restaurants[0];

    // Query all reviews for this restaurant, newest first
    const reviewsResult = await sql`
      SELECT id, rating, comment, created_at 
      FROM reviews 
      WHERE restaurant_id = ${restaurantId} 
      ORDER BY created_at DESC
    `;

    // Compute average rating and total reviews directly in database queries
    const avgResult = await sql`
      SELECT ROUND(AVG(rating)::numeric, 1) as average 
      FROM reviews 
      WHERE restaurant_id = ${restaurantId}
    `;

    const countResult = await sql`
      SELECT COUNT(*) as total 
      FROM reviews 
      WHERE restaurant_id = ${restaurantId}
    `;

    const averageRating = avgResult[0]?.average !== null && avgResult[0]?.average !== undefined
      ? Number(avgResult[0].average)
      : null;

    const totalReviews = Number(countResult[0]?.total || 0);

    // Separate latest review from older reviews
    const latestReviewRow = reviewsResult.length > 0 ? reviewsResult[0] : null;
    const olderReviewRows = reviewsResult.length > 1 ? reviewsResult.slice(1) : [];

    const latestReview = latestReviewRow
      ? {
          id: latestReviewRow.id,
          rating: latestReviewRow.rating,
          comment: latestReviewRow.comment,
          createdAt: latestReviewRow.created_at,
        }
      : null;

    const reviews = olderReviewRows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating,
      totalReviews,
      latestReview,
      reviews,
    });
  } catch (err) {
    console.error('Error fetching restaurant:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
