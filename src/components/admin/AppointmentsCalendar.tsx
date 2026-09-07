import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CalendarDays, ChevronLeft, ChevronRight, BellRing } from 'lucide-react';

export interface CalendarAppointment {
  id: string;
  patient_name: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const statusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    case 'pending':
      return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
    case 'completed':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-destructive/10 text-destructive border-destructive/30';
  }
};

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const AppointmentsCalendar = ({ appointments }: { appointments: CalendarAppointment[] }) => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(toKey(today));

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    appointments.forEach((a) => {
      const list = map.get(a.appointment_date) || [];
      list.push(a);
      map.set(a.appointment_date, list);
    });
    return map;
  }, [appointments]);

  const monthlyCounts = useMemo(() => {
    const counts = Array(12).fill(0) as number[];
    appointments.forEach((a) => {
      const d = new Date(a.appointment_date);
      if (d.getFullYear() === year) counts[d.getMonth()] += 1;
    });
    return counts;
  }, [appointments, year]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setMonth(next.getMonth());
    setYear(next.getFullYear());
  };

  const selectedList = selectedDay ? byDate.get(selectedDay) || [] : [];
  const maxCount = Math.max(1, ...monthlyCounts);
  const yearTotal = monthlyCounts.reduce((s, n) => s + n, 0);

  return (
    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          تقويم المواعيد
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="month" className="space-y-6">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="month" className="rounded-xl px-6">عرض شهري</TabsTrigger>
            <TabsTrigger value="year" className="rounded-xl px-6">عرض سنوي</TabsTrigger>
          </TabsList>

          <TabsContent value="month" className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" className="rounded-xl" onClick={() => changeMonth(-1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="text-lg font-bold">{MONTHS[month]} {year}</div>
              <Button variant="outline" size="icon" className="rounded-xl" onClick={() => changeMonth(1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2 font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`e-${idx}`} />;
                const key = toKey(new Date(year, month, day));
                const list = byDate.get(key) || [];
                const isToday = key === toKey(today);
                const isSelected = key === selectedDay;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(key)}
                    className={`min-h-[74px] rounded-xl border p-2 text-right transition-colors ${
                      isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/60'
                    }`}
                  >
                    <span className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>{day}</span>
                    {list.length > 0 && (
                      <div className="mt-1 space-y-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {list.length} موعد
                        </Badge>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">مواعيد {selectedDay}</h3>
              {selectedList.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد مواعيد في هذا اليوم.</p>
              ) : (
                selectedList
                  .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-3 rounded-xl border p-3 flex-wrap"
                    >
                      <div>
                        <p className="font-medium">{a.patient_name}</p>
                        <p className="text-sm text-muted-foreground">{a.service} • {a.appointment_time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BellRing className="h-3 w-3" />
                          تذكير تلقائي قبل ساعة
                        </span>
                        <Badge variant="outline" className={statusColor(a.status)}>{a.status}</Badge>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="year" className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setYear(year - 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="text-lg font-bold">{year} — {yearTotal} موعد</div>
              <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setYear(year + 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {MONTHS.map((name, i) => (
                <button
                  key={name}
                  onClick={() => { setMonth(i); }}
                  className={`rounded-xl border p-4 text-right transition-colors ${
                    i === month ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/60'
                  }`}
                >
                  <p className="font-semibold">{name}</p>
                  <p className="text-2xl font-bold">{monthlyCounts[i]}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(monthlyCounts[i] / maxCount) * 100}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
