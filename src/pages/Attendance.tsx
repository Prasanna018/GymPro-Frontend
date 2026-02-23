import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const Attendance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [members, setMembers] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [membersData, attendanceData] = await Promise.all([
        api.get('/members'),
        api.get(`/attendance?date=${selectedDate}`)
      ]);
      setMembers(membersData);
      setAttendanceRecords(attendanceData);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      toast({ title: 'Error', description: 'Failed to load attendance data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const activeMembersList = members.filter(m => m.status === 'active');

  const membersWithAttendance = activeMembersList.map(member => {
    // api.get runs keysToCamel() so member_id → memberId, check_in → checkIn, etc.
    const attendance = attendanceRecords.find(a => a.memberId === member.id);
    return {
      ...member,
      checkedIn: !!attendance,
      attendanceId: attendance?.id,
      checkInTime: attendance?.checkIn,
      checkOutTime: attendance?.checkOut,
    };
  });

  const filteredMembers = membersWithAttendance.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = membersWithAttendance.filter(m => m.checkedIn).length;
  const absentCount = activeMembersList.length - presentCount;

  const handleCheckIn = async (memberId: string, memberName: string) => {
    try {
      await api.post('/attendance/checkin', {
        member_id: memberId,
        date: selectedDate
      });
      toast({ title: 'Check-In Recorded', description: `${memberName} has been checked in.` });
      fetchData(); // Refresh to get the ID and time
    } catch (error) {
      console.error('Checkin failed:', error);
      toast({ title: 'Check-In Failed', description: 'An error occurred.', variant: 'destructive' });
    }
  };

  const handleCheckOut = async (attendanceId: string, memberName: string) => {
    try {
      await api.put(`/attendance/${attendanceId}/checkout`, {});
      toast({ title: 'Check-Out Recorded', description: `${memberName} has been checked out.` });
      fetchData(); // Refresh to update time
    } catch (error) {
      console.error('Checkout failed:', error);
      toast({ title: 'Check-Out Failed', description: 'An error occurred.', variant: 'destructive' });
    }
  };

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            ATTENDANCE <span className="text-gradient-primary">TRACKING</span>
          </h1>
          <p className="text-muted-foreground mt-1">Track member check-ins and check-outs.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-accent/20 flex-shrink-0">
                <UserCheck className="h-5 w-5 md:h-6 md:w-6 text-accent" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Present</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">{presentCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-warning/20 flex-shrink-0">
                <UserX className="h-5 w-5 md:h-6 md:w-6 text-warning" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Absent</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">{absentCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-primary/20 flex-shrink-0">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Rate</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">
                  {activeMembersList.length > 0
                    ? Math.round((presentCount / activeMembersList.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-info/20 flex-shrink-0">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-info" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Peak</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">6-8 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 bg-muted/30 rounded-xl p-2 w-full sm:w-auto">
            <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-2 flex-1 justify-center">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto text-foreground w-auto text-sm"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => changeDate(1)} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden bg-gradient-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Member</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Check-In</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Check-Out</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-medium">{member.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-foreground">{member.phone}</td>
                    <td className="py-4 px-6">
                      {member.checkInTime ? <span className="text-foreground">{member.checkInTime}</span> : <span className="text-muted-foreground">--:--</span>}
                    </td>
                    <td className="py-4 px-6">
                      {member.checkOutTime ? <span className="text-foreground">{member.checkOutTime}</span> : <span className="text-muted-foreground">--:--</span>}
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={member.checkedIn ? 'bg-accent/20 text-accent border-accent/30' : 'bg-muted/50 text-muted-foreground border-border'}>
                        {member.checkedIn ? 'Present' : 'Absent'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!member.checkedIn ? (
                        <Button variant="hero" size="sm" onClick={() => handleCheckIn(member.id, member.name)}>Check In</Button>
                      ) : !member.checkOutTime ? (
                        <Button variant="outline" size="sm" onClick={() => handleCheckOut(member.attendanceId, member.name)}>Check Out</Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-gradient-card rounded-xl border border-border/50 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                  </div>
                </div>
                <Badge className={member.checkedIn ? 'bg-accent/20 text-accent border-accent/30' : 'bg-muted/50 text-muted-foreground border-border'}>
                  {member.checkedIn ? 'Present' : 'Absent'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-xs text-muted-foreground">Check-In</span>
                  <p className="text-foreground">{member.checkInTime || '--:--'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Check-Out</span>
                  <p className="text-foreground">{member.checkOutTime || '--:--'}</p>
                </div>
              </div>
              {!member.checkedIn ? (
                <Button variant="hero" size="sm" className="w-full" onClick={() => handleCheckIn(member.id, member.name)}>Check In</Button>
              ) : !member.checkOutTime ? (
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleCheckOut(member.attendanceId, member.name)}>Check Out</Button>
              ) : (
                <p className="text-sm text-center text-muted-foreground">Completed</p>
              )}
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No members found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
