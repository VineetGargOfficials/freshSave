import {
  Award,
  BadgeCheck,
  Handshake,
  HeartHandshake,
  Leaf,
  TicketPercent,
  Truck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const iconMap = {
  Award,
  BadgeCheck,
  Handshake,
  HeartHandshake,
  Leaf,
  TicketPercent,
  Truck,
};

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  sky: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  violet: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  rose: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export default function RoleBadges() {
  const { user } = useAuth();
  const badges = user?.badges || [];

  if (badges.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Earned Badges</h2>
          <p className="text-sm text-muted-foreground">Your milestone rewards across donations, connections, and impact.</p>
        </div>
        <Badge variant="outline">{badges.length}</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge) => {
          const Icon = iconMap[badge.icon as keyof typeof iconMap] || Award;
          return (
            <div key={badge.badgeId} className={`rounded-2xl border p-4 ${colorMap[badge.color] || colorMap.emerald}`}>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-background/70 p-2">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{badge.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  <Badge variant="outline" className="mt-2">
                    {badge.category}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
