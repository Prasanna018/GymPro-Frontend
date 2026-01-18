import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { dashboardStats, mockMembers, membershipPlans, mockSupplements } from '@/lib/mockData';
import { 
  Users, 
  IndianRupee, 
  TrendingUp,
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const { toast } = useToast();

  // Monthly revenue data
  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  // Membership distribution data
  const membershipData = membershipPlans.map(plan => ({
    name: plan.name,
    value: mockMembers.filter(m => m.planId === plan.id).length,
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--info))', 'hsl(var(--warning))'];

  // Attendance trend data
  const attendanceData = [
    { day: 'Mon', attendance: 45 },
    { day: 'Tue', attendance: 52 },
    { day: 'Wed', attendance: 48 },
    { day: 'Thu', attendance: 55 },
    { day: 'Fri', attendance: 60 },
    { day: 'Sat', attendance: 75 },
    { day: 'Sun', attendance: 40 },
  ];

  // Product sales data
  const productSalesData = mockSupplements.slice(0, 5).map(p => ({
    name: p.name.split(' ')[0],
    sales: Math.floor(Math.random() * 50) + 10,
  }));

  const handleExportReport = (reportType: string) => {
    toast({
      title: 'Report Exported',
      description: `${reportType} report has been downloaded.`,
    });
  };

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              ANALYTICS & <span className="text-gradient-primary">REPORTS</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              View detailed analytics and generate reports.
            </p>
          </div>
          <Button 
            variant="hero" 
            className="gap-2"
            onClick={() => handleExportReport('Complete')}
          >
            <Download className="h-4 w-4" />
            Export All Reports
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.totalMembers}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/20">
                <IndianRupee className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-info/20">
                <TrendingUp className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">₹{dashboardStats.monthlyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/20">
                <Package className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products Sold</p>
                <p className="text-2xl font-bold text-foreground">156</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Monthly Revenue
                </CardTitle>
                <CardDescription>Revenue trend over the last 6 months</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleExportReport('Revenue')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Membership Distribution */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-accent" />
                  Membership Distribution
                </CardTitle>
                <CardDescription>Members by plan type</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleExportReport('Membership')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {membershipData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendance Trend */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-info" />
                  Weekly Attendance
                </CardTitle>
                <CardDescription>Average daily attendance this week</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleExportReport('Attendance')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="hsl(var(--info))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--info))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Sales */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-warning" />
                  Top Selling Products
                </CardTitle>
                <CardDescription>Best performing supplements this month</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleExportReport('Products')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productSalesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
