// src/pages/ngo/NGODashboard.tsx
import ComingSoonWrapper from "@/components/common/ComingSoonWrapper";

const ngoFeatures = [
  {
    title: "Real-time Donation Alerts",
    description: "Get instant notifications when nearby restaurants have surplus food available.",
    icon: "🔔"
  },
  {
    title: "Smart Route Planning",
    description: "Optimized pickup routes to collect food from multiple locations efficiently.",
    icon: "🗺️"
  },
  {
    title: "Pickup Scheduling",
    description: "Schedule and manage food pickups with automated reminders.",
    icon: "📅"
  },
  {
    title: "Impact Analytics",
    description: "Track meals distributed, food saved from waste, and environmental impact.",
    icon: "📊"
  },
  {
    title: "Volunteer Management",
    description: "Coordinate volunteers for food collection and distribution.",
    icon: "👥"
  },
  {
    title: "Donor Communication",
    description: "Direct chat with restaurants and caterers for seamless coordination.",
    icon: "💬"
  },
  {
    title: "Beneficiary Tracking",
    description: "Manage and track beneficiaries receiving food donations.",
    icon: "🎯"
  },
  {
    title: "Tax Benefit Reports",
    description: "Generate certificates and reports for tax exemptions.",
    icon: "📋"
  },
  {
    title: "Food Safety Compliance",
    description: "Track food handling, storage, and safety compliance.",
    icon: "✅"
  }
];

export default function NGODashboard() {
  return (
    <ComingSoonWrapper
      title="NGO Portal"
      subtitle="FreshSave for Organizations"
      description="Connect with local restaurants, reduce food waste, and help feed those in need. Our platform streamlines food rescue operations for maximum impact."
      features={ngoFeatures}
      icon="🤝"
      gradientFrom="from-blue-500/5"
      gradientTo="to-purple-500/5"
      accentColor="from-blue-500 to-purple-600"
      estimatedLaunch="Q2 2025"
    />
  );
}