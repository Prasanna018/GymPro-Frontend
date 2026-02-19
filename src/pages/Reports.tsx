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

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const membershipData = membershipPlans.map(plan => ({
    name: plan.name,
    value: mockMembers.filter(m => m.planId === plan.id).length,
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--info))', 'hsl(var(--warning))'];

  const attendanceData = [
    { day: 'Mon', attendance: 45 },
    { day: 'Tue', attendance: 52 },
    { day: 'Wed', attendance: 48 },
    { day: 'Thu', attendance: 55 },
    { day: 'Fri', attendance: 60 },
    { day: 'Sat', attendance: 75 },
    { day: 'Sun', attendance: 40 },
  ];

  const productSalesData = mockSupplements.slice(0, 5).map(p => ({
    name: p.name.split(' ')[0],
    sales: Math.floor(Math.random() * 50) + 10,
  }));

  const handleExportReport = (reportType: string) => {
    toast({ title: 'Report Exported', description: `${reportType} report has been downloaded.` });
  };

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              ANALYTICS & <span className="text-gradient-primary">REPORTS</span>
            </h1>
            <p className="text-muted-foreground mt-1">View detailed analytics and generate reports.</p>
          </div>
          <Button variant="hero" className="gap-2 w-full sm:w-auto" onClick={() => handleExportReport('Complete')}>
            <Download className="h-4 w-4" />Export All Reports
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-primary/20 flex-shrink-0">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Members</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">{dashboardStats.totalMembers}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-accent/20 flex-shrink-0">
                <IndianRupee className="h-5 w-5 md:h-6 md:w-6 text-accent" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Revenue</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-info/20 flex-shrink-0">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-info" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">This Month</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">₹{dashboardStats.monthlyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-warning/20 flex-shrink-0">
                <Package className="h-5 w-5 md:h-6 md:w-6 text-warning" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Sold</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">156</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Revenue Chart */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2 text-base md:text-lg">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />Monthly Revenue
                </CardTitle>
                <CardDescription className="text-xs">Last 6 months</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleExportReport('Revenue')}>
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} width={55} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Membership Distribution */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2 text-base md:text-lg">
                  <PieChart className="h-4 w-4 md:h-5 md:w-5 text-accent" />Membership
                </CardTitle>
                <CardDescription className="text-xs">By plan type</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleExportReport('Membership')}>
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <RePieChart>
                  <Pie data={membershipData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                    {membershipData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendance Trend */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2 text-base md:text-lg">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-info" />Weekly Attendance
                </CardTitle>
                <CardDescription className="text-xs">This week</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleExportReport('Attendance')}>
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="attendance" stroke="hsl(var(--info))" strokeWidth={3} dot={{ fill: 'hsl(var(--info))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Sales */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2 text-base md:text-lg">
                  <Package className="h-4 w-4 md:h-5 md:w-5 text-warning" />Top Products
                </CardTitle>
                <CardDescription className="text-xs">Best selling this month</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleExportReport('Products')}>
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={productSalesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={65} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
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
