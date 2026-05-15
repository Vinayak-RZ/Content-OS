import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { HomeHero } from "@/components/home-hero";

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <AppHeader title="Overview" breadcrumb="Pages" />
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <HomeHero />
        </div>
      </div>
    </div>
  );
}
