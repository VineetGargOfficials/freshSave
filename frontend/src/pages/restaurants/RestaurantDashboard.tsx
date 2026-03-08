// src/pages/restaurant/RestaurantDashboard.tsx
import ComingSoonWrapper from "@/components/common/ComingSoonWrapper";

const restaurantFeatures = [
  {
    title: "Quick Food Listing",
    description: "List surplus food in seconds with our easy-to-use interface and photo upload.",
    icon: "📸"
  },
  {
    title: "NGO Matching",
    description: "Automatically connect with verified NGOs in your area for quick pickups.",
    icon: "🤝"
  },
  {
    title: "Pickup Management",
    description: "Schedule and track food pickups with real-time status updates.",
    icon: "🚚"
  },
  {
    title: "Waste Analytics",
    description: "Understand your food waste patterns and reduce costs with detailed reports.",
    icon: "📈"
  },
  {
    title: "Tax Documentation",
    description: "Automatic generation of donation certificates for tax benefits.",
    icon: "📄"
  },
  {
    title: "Inventory Integration",
    description: "Connect with your POS system for automated surplus detection.",
    icon: "🔗"
  },
  {
    title: "Customer Donations",
    description: "Enable customers to donate meals directly through your menu.",
    icon: "❤️"
  },
  {
    title: "Sustainability Badge",
    description: "Earn and display sustainability badges to attract eco-conscious customers.",
    icon: "🏆"
  },
  {
    title: "Multi-branch Support",
    description: "Manage donations across all your restaurant locations from one dashboard.",
    icon: "🏪"
  }
];

export default function RestaurantDashboard() {
  return (
    <ComingSoonWrapper
      title="Restaurant & Caterer Portal"
      subtitle="FreshSave for Businesses"
      description="Turn your surplus food into social impact. Connect with NGOs, reduce waste, and contribute to your community while saving costs."
      features={restaurantFeatures}
      icon="🍽️"
      gradientFrom="from-orange-500/5"
      gradientTo="to-red-500/5"
      accentColor="from-orange-500 to-red-600"
      estimatedLaunch="Q2 2025"
    />
  );
}