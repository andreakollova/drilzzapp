import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface UserGrowthData {
  date: string;
  users: number;
}

interface SportDistribution {
  name: string;
  value: number;
}

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  follows: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export const AdminAnalyticsDashboard = () => {
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [sportDistribution, setSportDistribution] = useState<SportDistribution[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      // Load user growth data (last 30 days)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (profilesError) throw profilesError;

      // Process user growth by day
      const days = eachDayOfInterval({
        start: thirtyDaysAgo,
        end: new Date(),
      });

      const usersByDay = days.map(day => {
        const dayStart = startOfDay(day);
        const count = profiles?.filter(p => {
          const createdAt = startOfDay(new Date(p.created_at));
          return createdAt <= dayStart;
        }).length || 0;
        
        return {
          date: format(day, "MMM d"),
          users: count,
        };
      });

      // Calculate cumulative users
      const { count: totalUsersBefore } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .lt("created_at", thirtyDaysAgo.toISOString());

      const baseCount = totalUsersBefore || 0;
      let cumulative = baseCount;
      const cumulativeGrowth = days.map(day => {
        const newUsersOnDay = profiles?.filter(p => {
          const createdAt = new Date(p.created_at);
          return format(createdAt, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
        }).length || 0;
        
        cumulative += newUsersOnDay;
        return {
          date: format(day, "MMM d"),
          users: cumulative,
        };
      });

      setUserGrowth(cumulativeGrowth);

      // Load sport distribution
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("profiles")
        .select("sport");

      if (allProfilesError) throw allProfilesError;

      const sportCounts: Record<string, number> = {};
      allProfiles?.forEach(p => {
        if (p.sport) {
          sportCounts[p.sport] = (sportCounts[p.sport] || 0) + 1;
        }
      });

      const sportData = Object.entries(sportCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setSportDistribution(sportData);

      // Load engagement data (likes, comments, follows over last 30 days)
      const [likesData, commentsData, followsData] = await Promise.all([
        supabase
          .from("likes")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("comments")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("follows")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo.toISOString()),
      ]);

      if (likesData.error) throw likesData.error;
      if (commentsData.error) throw commentsData.error;
      if (followsData.error) throw followsData.error;

      const engagementByDay = days.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        
        const likesOnDay = likesData.data?.filter(l => 
          format(new Date(l.created_at), "yyyy-MM-dd") === dayStr
        ).length || 0;
        
        const commentsOnDay = commentsData.data?.filter(c => 
          format(new Date(c.created_at), "yyyy-MM-dd") === dayStr
        ).length || 0;
        
        const followsOnDay = followsData.data?.filter(f => 
          format(new Date(f.created_at), "yyyy-MM-dd") === dayStr
        ).length || 0;

        return {
          date: format(day, "MMM d"),
          likes: likesOnDay,
          comments: commentsOnDay,
          follows: followsOnDay,
        };
      });

      setEngagementData(engagementByDay);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Growth (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sport Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Users by Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {sportDistribution.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sportDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    >
                      {sportDistribution.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [value, "Users"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="likes" 
                  name="Likes"
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="comments" 
                  name="Comments"
                  fill="hsl(var(--secondary))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="follows" 
                  name="Follows"
                  fill="hsl(var(--accent))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Drill Distribution by Sport */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Drills by Sport</CardTitle>
        </CardHeader>
        <CardContent>
          <DrillsBySportChart />
        </CardContent>
      </Card>
    </div>
  );
};

// Separate component for drills by sport chart
const DrillsBySportChart = () => {
  const [data, setData] = useState<SportDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: drills, error } = await supabase
        .from("drills")
        .select("sport");

      if (error) throw error;

      const sportCounts: Record<string, number> = {};
      drills?.forEach(d => {
        if (d.sport) {
          sportCounts[d.sport] = (sportCounts[d.sport] || 0) + 1;
        }
      });

      const chartData = Object.entries(sportCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setData(chartData);
    } catch (error) {
      console.error("Error loading drills by sport:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No drills available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            type="number"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [value, "Drills"]}
          />
          <Bar 
            dataKey="value" 
            fill="hsl(var(--primary))" 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
