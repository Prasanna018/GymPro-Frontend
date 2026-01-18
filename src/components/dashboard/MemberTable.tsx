import { Member, MembershipPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MemberTableProps {
  members: Member[];
  plans: MembershipPlan[];
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
}

export const MemberTable = ({ members, plans, onEdit, onDelete }: MemberTableProps) => {
  const getPlanName = (planId: string) => {
    return plans.find(p => p.id === planId)?.name || 'Unknown';
  };

  const getStatusBadge = (status: Member['status']) => {
    const styles = {
      active: 'bg-accent/20 text-accent border-accent/30',
      expired: 'bg-destructive/20 text-destructive border-destructive/30',
      pending: 'bg-warning/20 text-warning border-warning/30',
    };
    return (
      <Badge className={cn('border', styles[status])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="bg-gradient-card rounded-xl border border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Member</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Plan</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Due Amount</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Expiry</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr 
                key={member.id} 
                className="border-b border-border/30 hover:bg-muted/30 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-foreground">{getPlanName(member.planId)}</span>
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(member.status)}
                </td>
                <td className="py-4 px-6">
                  <span className={cn(
                    'font-medium',
                    member.dueAmount > 0 ? 'text-destructive' : 'text-accent'
                  )}>
                    ₹{member.dueAmount.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-muted-foreground">{member.expiryDate}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(member)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(member)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
