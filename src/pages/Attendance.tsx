import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockMembers, mockAttendance } from '@/lib/mockData';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const Attendance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const activeMembersList = mockMembers.filter(m => m.status === 'active');

  const todayAttendance = mockAttendance.filter(
    a => a.date === selectedDate
  );

  const membersWithAttendance = activeMembersList.map(member => {
    const attendance = todayAttendance.find(a => a.memberId === member.id);
    return {
      ...member,
      checkedIn: !!attendance,
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

  const handleCheckIn = (memberId: string, memberName: string) => {
    toast({
      title: 'Check-In Recorded',
      description: `${memberName} has been checked in.`,
    });
  };

  const handleCheckOut = (memberId: string, memberName: string) => {
    toast({
      title: 'Check-Out Recorded',
      description: `${memberName} has been checked out.`,
    });
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
          <p className="text-muted-foreground mt-1">
            Track member check-ins and check-outs.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/20">
                <UserCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-foreground">{presentCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/20">
                <UserX className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent Today</p>
                <p className="text-2xl font-bold text-foreground">{absentCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {activeMembersList.length > 0 
                    ? Math.round((presentCount / activeMembersList.length) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-info/20">
                <Clock className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peak Hours</p>
                <p className="text-2xl font-bold text-foreground">6-8 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeDate(-1)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3">
              <Calendar className="h-4 w-4 text-primary" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto w-auto text-foreground"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeDate(1)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Attendance Table */}
        <div className="rounded-xl border border-border/50 overflow-hidden bg-gradient-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Member</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground">Check-In</TableHead>
                <TableHead className="text-muted-foreground">Check-Out</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="border-border/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{member.phone}</TableCell>
                  <TableCell>
                    {member.checkInTime ? (
                      <span className="text-foreground">{member.checkInTime}</span>
                    ) : (
                      <span className="text-muted-foreground">--:--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.checkOutTime ? (
                      <span className="text-foreground">{member.checkOutTime}</span>
                    ) : (
                      <span className="text-muted-foreground">--:--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        member.checkedIn
                          ? 'bg-accent/20 text-accent border-accent/30'
                          : 'bg-muted/50 text-muted-foreground border-border'
                      }
                    >
                      {member.checkedIn ? 'Present' : 'Absent'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!member.checkedIn ? (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => handleCheckIn(member.id, member.name)}
                        >
                          Check In
                        </Button>
                      ) : !member.checkOutTime ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckOut(member.id, member.name)}
                        >
                          Check Out
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">Completed</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
