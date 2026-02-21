import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
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
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [membershipData, setMembershipData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [productSalesData, setProductSalesData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, revenueRes, membershipRes, attendanceRes, productsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/reports/revenue'),
        api.get('/reports/membership'),
        api.get('/reports/attendance'),
        api.get('/reports/products')
      ]);
      setStats(statsRes);
      setRevenueData(revenueRes.reverse()); // Reverse to show oldest to newest
      setMembershipData(membershipRes);
      setAttendanceData(attendanceRes.reverse());
      setProductSalesData(productsRes);
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
      toast({ title: 'Error', description: 'Failed to load report data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--info))', 'hsl(var(--warning))'];

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
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 rounded-xl bg-primary/20 flex-shrink-0">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Members</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stats?.totalMembers || 0}</p>
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
                  <p className="text-lg md:text-2xl font-bold text-foreground">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
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
                  <p className="text-lg md:text-2xl font-bold text-foreground">₹{(stats?.monthlyRevenue || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 rounded-xl bg-warning/20 flex-shrink-0">
                  <Package className="h-5 w-5 md:h-6 md:w-6 text-warning" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Products</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">Top 5</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
