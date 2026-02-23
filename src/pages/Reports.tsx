import { useState, useEffect, useRef } from 'react';
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
  Download,
  FileDown,
  Loader2,
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
  Legend,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import {
  exportCompletePDF,
  exportRevenuePDF,
  exportMembershipPDF,
  exportAttendancePDF,
  exportProductsPDF,
} from '@/lib/pdfExport';

// ── Custom tooltip for charts ─────────────────────────────────────────────
const ChartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
};

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--info))',
  'hsl(var(--warning))',
  '#f472b6',
  '#a78bfa',
];

// ── Per-report download button ────────────────────────────────────────────
function DownloadBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={loading}
      className="gap-1 text-xs text-muted-foreground hover:text-foreground"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      <span className="hidden sm:inline">PDF</span>
    </Button>
  );
}

const Reports = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState('');   // track which report is exporting
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
        api.get('/reports/products'),
      ]);
      setStats(statsRes);
      setRevenueData(revenueRes.reverse());
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

  // ── Export handlers ───────────────────────────────────────────────────────
  const handleExport = async (reportType: 'complete' | 'revenue' | 'membership' | 'attendance' | 'products') => {
    if (isLoading || exporting) return;
    setExporting(reportType);
    try {
      await new Promise(r => setTimeout(r, 50)); // let UI update
      switch (reportType) {
        case 'complete':
          exportCompletePDF({ stats, revenueData, membershipData, attendanceData, productSalesData });
          break;
        case 'revenue':
          exportRevenuePDF(revenueData, stats);
          break;
        case 'membership':
          exportMembershipPDF(membershipData, stats);
          break;
        case 'attendance':
          exportAttendancePDF(attendanceData);
          break;
        case 'products':
          exportProductsPDF(productSalesData);
          break;
      }
      toast({
        title: '✓ Report Downloaded',
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} PDF saved successfully.`,
      });
    } catch (err) {
      console.error('PDF export error:', err);
      toast({ title: 'Export Failed', description: 'Could not generate PDF. Try again.', variant: 'destructive' });
    } finally {
      setExporting('');
    }
  };

  // ── Revenue formatter ─────────────────────────────────────────────────────
  const formatRupee = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              ANALYTICS &amp; <span className="text-gradient-primary">REPORTS</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              View detailed analytics and download professional PDF reports.
            </p>
          </div>
          <Button
            variant="hero"
            className="gap-2 w-full sm:w-auto"
            onClick={() => handleExport('complete')}
            disabled={isLoading || !!exporting}
          >
            {exporting === 'complete' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Export All Reports
          </Button>
        </div>

        {/* ── Summary Stat Cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card animate-pulse">
                <div className="h-12 bg-muted/40 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 rounded-xl bg-primary/20 flex-shrink-0">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Members</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stats?.totalMembers ?? 0}</p>
                  <p className="text-xs text-accent">{stats?.activeMembers ?? 0} active</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 rounded-xl bg-accent/20 flex-shrink-0">
                  <IndianRupee className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    ₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
                  </p>
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
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    ₹{(stats?.monthlyRevenue ?? 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 rounded-xl bg-warning/20 flex-shrink-0">
                  <Package className="h-5 w-5 md:h-6 md:w-6 text-warning" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Pending Dues</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    ₹{(stats?.pendingDues ?? 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Charts Grid ── */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">

          {/* Revenue Chart */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2 text-base md:text-lg">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Monthly Revenue
                </CardTitle>
                <CardDescription className="text-xs">Last 6 months</CardDescription>
              </div>
              <DownloadBtn
                onClick={() => handleExport('revenue')}
                loading={exporting === 'revenue'}
              />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[220px] bg-muted/20 rounded-lg animate-pulse" />
              ) : revenueData.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                  No revenue data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} width={60} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={ChartTooltipStyle}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Membership Distribution */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2 text-base md:text-lg">
                  <PieChart className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                  Membership
                </CardTitle>
                <CardDescription className="text-xs">By plan type</CardDescription>
              </div>
              <DownloadBtn
                onClick={() => handleExport('membership')}
                loading={exporting === 'membership'}
              />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[220px] bg-muted/20 rounded-lg animate-pulse" />
              ) : membershipData.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                  No plan data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <RePieChart>
                    <Pie
                      data={membershipData}
                      cx="50%"
                      cy="45%"
                      outerRadius={75}
                      dataKey="value"
                      label={({ name, percent }) =>
                        percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                      }
                      labelLine={false}
                    >
                      {membershipData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={ChartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Attendance Trend */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2 text-base md:text-lg">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-info" />
                  Weekly Attendance
                </CardTitle>
                <CardDescription className="text-xs">
                  Last 7 days — total{' '}
                  <span className="text-foreground font-semibold">
                    {attendanceData.reduce((s, a) => s + a.attendance, 0)} check-ins
                  </span>
                </CardDescription>
              </div>
              <DownloadBtn
                onClick={() => handleExport('attendance')}
                loading={exporting === 'attendance'}
              />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[220px] bg-muted/20 rounded-lg animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={ChartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="hsl(var(--info))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--info))', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Check-ins"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Product Sales */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2 text-base md:text-lg">
                  <Package className="h-4 w-4 md:h-5 md:w-5 text-warning" />
                  Top Products
                </CardTitle>
                <CardDescription className="text-xs">Best selling this month</CardDescription>
              </div>
              <DownloadBtn
                onClick={() => handleExport('products')}
                loading={exporting === 'products'}
              />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[220px] bg-muted/20 rounded-lg animate-pulse" />
              ) : productSalesData.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                  No product sales yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={productSalesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      width={70}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip contentStyle={ChartTooltipStyle} formatter={(v: number) => [v, 'Units Sold']} />
                    <Bar dataKey="sales" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Quick Export Panel ── */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              <FileDown className="h-4 w-4 text-primary" />
              Download Individual Reports
            </CardTitle>
            <CardDescription className="text-xs">
              Each PDF includes branded headers, data tables with visual trend bars, and summary stats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'revenue', label: 'Revenue', icon: IndianRupee, color: 'text-accent' },
                { key: 'membership', label: 'Membership', icon: Users, color: 'text-primary' },
                { key: 'attendance', label: 'Attendance', icon: Calendar, color: 'text-info' },
                { key: 'products', label: 'Products', icon: Package, color: 'text-warning' },
              ].map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => handleExport(key as any)}
                  disabled={isLoading || !!exporting}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`p-2 rounded-lg bg-muted/30 group-hover:scale-110 transition-transform ${color}`}>
                    {exporting === key ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground">{label}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Download className="h-3 w-3" /> PDF
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default Reports;
