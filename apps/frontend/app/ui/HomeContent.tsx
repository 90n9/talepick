"use client";

import { MOCK_REVIEWS, MOCK_STORIES } from '@lib/constants';
import FeaturedStoriesSection from './home/FeaturedStoriesSection';
import HeroSection from './home/HeroSection';
import HowItWorksSection from './home/HowItWorksSection';
import ReviewsSection from './home/ReviewsSection';
import SupportSection from './home/SupportSection';
import ScrollRevealClient from './home/ScrollRevealClient';

export default function HomeContent() {
  const featured = MOCK_STORIES.slice(0, 3);

  return (
    <div>
      <HeroSection storyCount={MOCK_STORIES.length} reviewCount={MOCK_REVIEWS.length} />
      <ScrollRevealClient />
      <FeaturedStoriesSection stories={featured} />
      <HowItWorksSection />
      <ReviewsSection />
    </div>
  );
}
