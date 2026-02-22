import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Timer
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const MemberAttendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      // Fetch all attendance to calculate stats correctly
      const data = await api.get('/attendance/me');
      setAllAttendance(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMonthAttendance = allAttendance.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === selectedMonth.getMonth() &&
      date.getFullYear() === selectedMonth.getFullYear();
  });

  const calculateStreak = (records: any[]) => {
    if (records.length === 0) return 0;
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const todayStr = currentDate.toISOString().split('T')[0];
    const hasToday = sorted.some(r => r.date === todayStr);

    if (!hasToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (const record of sorted) {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);

      if (recordDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (recordDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    return streak;
  };

  const calculateTotalHours = (records: any[]) => {
    let totalMinutes = 0;
    records.forEach(r => {
      if (r.checkIn && r.checkOut) {
        const [inH, inM] = r.checkIn.split(':').map(Number);
        const [outH, outM] = r.checkOut.split(':').map(Number);
        totalMinutes += (outH * 60 + outM) - (inH * 60 + inM);
      }
    });
    return Math.floor(totalMinutes / 60);
  };

  const calculateAverageTime = (records: any[]) => {
    const validRecords = records.filter(r => r.checkIn && r.checkOut);
    if (validRecords.length === 0) return '0h 0m';

    let totalMinutes = 0;
    validRecords.forEach(r => {
      const [inH, inM] = r.checkIn.split(':').map(Number);
      const [outH, outM] = r.checkOut.split(':').map(Number);
      totalMinutes += (outH * 60 + outM) - (inH * 60 + inM);
    });

    const avgMinutes = Math.floor(totalMinutes / validRecords.length);
    const h = Math.floor(avgMinutes / 60);
    const m = avgMinutes % 60;
    return `${h}h ${m}m`;
  };

  const totalDaysThisMonth = currentMonthAttendance.length;
  const currentStreak = calculateStreak(allAttendance);
  const totalHours = calculateTotalHours(allAttendance);
  const averageTime = calculateAverageTime(allAttendance);

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedMonth(newDate);
  };

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/checkin', { date: new Date().toISOString().split('T')[0] });
      toast({
        title: 'Checked In!',
        description: 'Your attendance has been recorded. Have a great workout!',
      });
      fetchAttendance();
    } catch (error: any) {
      toast({
        title: 'Check In Failed',
        description: error.message || 'Could not mark attendance.',
        variant: 'destructive'
      });
    }
  };

  const monthName = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const generateCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendance = currentMonthAttendance.find(a => a.date === dateStr);
      days.push({ day, attended: !!attendance, date: dateStr });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <DashboardLayout requiredRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              MY <span className="text-gradient-primary">ATTENDANCE</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your gym visits and workout streak.
            </p>
          </div>
          <Button variant="hero" className="gap-2" onClick={handleCheckIn}>
            <CheckCircle className="h-4 w-4" />
            Check In Now
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days {selectedMonth.toLocaleString('default', { month: 'short' })}</p>
                <p className="text-2xl font-bold text-foreground">{totalDaysThisMonth}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/20">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{currentStreak} days</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-info/20">
                <Timer className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Workout Time</p>
                <p className="text-2xl font-bold text-foreground">{averageTime}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/20">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-foreground text-base md:text-lg">Attendance Calendar</CardTitle>
              <CardDescription className="text-xs">Your gym visits for {monthName}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-foreground font-medium text-sm min-w-[120px] text-center">
                {monthName}
              </span>
              <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-3">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-xs md:text-sm
                    ${day === null
                      ? 'bg-transparent'
                      : day.attended
                        ? 'bg-accent/20 text-accent border border-accent/30 font-bold'
                        : 'bg-muted/30 text-muted-foreground'
                    }
                  `}
                >
                  {day?.day}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-accent/20 border border-accent/30" />
                <span>Attended</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-muted/30" />
                <span>Not visited</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Check-ins</CardTitle>
            <CardDescription>Your latest gym visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allAttendance.length > 0 ? (
                allAttendance.slice(0, 5).map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <Calendar className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.checkIn} - {record.checkOut || 'Active'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-accent/20 text-accent border-accent/30 border">
                      {record.checkOut ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found. Click "Check In Now" to start!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberAttendance;
