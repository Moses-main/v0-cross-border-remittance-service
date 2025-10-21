import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { DashboardSection } from "@/components/dashboard-section"
import { RewardsSection } from "@/components/rewards-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <DashboardSection />
      <RewardsSection />
      <div className="h-20 md:h-0" />
      <Footer />
    </main>
  )
}
