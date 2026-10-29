import WriteReviewForm from './WriteReviewForm';
import Link from 'next/link';

export const instant = false;

export default async function WriteReviewPage(props: { params: Promise<{ restaurantId: string }> }) {
  const params = await props.params;
  const restaurantId = params.restaurantId;

  return (
    <WriteReviewForm restaurantId={restaurantId} />
  );
}
