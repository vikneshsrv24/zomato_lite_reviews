import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurantId, rating, comment } = body;

    // 1. Validate rating is an integer between 1 and 5
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a whole number between 1 and 5.' },
        { status: 400 }
      );
    }

    // 2. Validate comment is a non-empty string after trimming whitespace
    if (typeof comment !== 'string' || comment.trim() === '') {
      return NextResponse.json(
        { error: 'Comment cannot be empty.' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 3. Validate restaurant actually exists in the database
    const restaurants = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: 'Restaurant does not exist.' },
        { status: 400 }
      );
    }

    // 4. On success, insert exactly one row
    const result = await sql`
      INSERT INTO reviews (restaurant_id, rating, comment)
      VALUES (${restaurantId}, ${rating}, ${comment.trim()})
      RETURNING id
    `;

    const reviewId = result[0].id;

    return NextResponse.json({ success: true, reviewId }, { status: 201 });
  } catch (err) {
    console.error('Error posting review:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
