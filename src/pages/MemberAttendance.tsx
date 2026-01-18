import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockAttendance } from '@/lib/mockData';
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

const MemberAttendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Get current month's attendance for this member
  const memberAttendance = mockAttendance.filter(a => 
    a.memberId === (user?.id || 'm1')
  );

  const currentMonthAttendance = memberAttendance.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === selectedMonth.getMonth() &&
           date.getFullYear() === selectedMonth.getFullYear();
  });

  const totalDaysThisMonth = currentMonthAttendance.length;
  const averageTime = '1h 45m'; // Mock average workout time

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedMonth(newDate);
  };

  const handleCheckIn = () => {
    toast({
      title: 'Checked In!',
      description: 'Your attendance has been recorded. Have a great workout!',
    });
  };

  const monthName = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
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
        <div className="grid md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days This Month</p>
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
                <p className="text-2xl font-bold text-foreground">5 days</p>
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
                <p className="text-2xl font-bold text-foreground">28h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Attendance Calendar</CardTitle>
              <CardDescription>Your gym visits for {monthName}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-foreground font-medium min-w-[140px] text-center">
                {monthName}
              </span>
              <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm text-muted-foreground font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm
                    ${day === null 
                      ? '' 
                      : day.attended 
                        ? 'bg-accent/20 text-accent border border-accent/30' 
                        : 'bg-muted/30 text-muted-foreground'
                    }
                  `}
                >
                  {day?.day}
                  {day?.attended && (
                    <CheckCircle className="h-3 w-3 ml-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Check-ins</CardTitle>
            <CardDescription>Your last 5 gym visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberAttendance.slice(0, 5).map((record, index) => (
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
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    {record.checkOut 
                      ? 'Completed' 
                      : 'In Progress'
                    }
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberAttendance;
