"use client";

import { MOCK_STORIES } from "@lib/constants";
import FeaturedStoriesSection from "./home/FeaturedStoriesSection";
import HeroSection from "./home/HeroSection";
import HowItWorksSection from "./home/HowItWorksSection";
import ReviewsSection from "./home/ReviewsSection";
import ScrollRevealClient from "./home/ScrollRevealClient";
import { useEffect, useState } from "react";

export default function HomeContent() {
  const [scrollY, setScrollY] = useState(0);
  const featured = MOCK_STORIES.slice(0, 3);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div>
      <ScrollRevealClient />
      <HeroSection scrollY={scrollY} />
      <FeaturedStoriesSection stories={featured} scrollY={scrollY} />
      <HowItWorksSection scrollY={scrollY} />
      <ReviewsSection />
    </div>
  );
}
