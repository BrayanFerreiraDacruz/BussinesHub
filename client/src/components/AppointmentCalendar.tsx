import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: number;
  startTime: Date;
  endTime: Date;
  clientId: number;
  serviceId: number;
  status: string | null;
}

interface AppointmentCalendarProps {
  appointments: Appointment[] | undefined;
  onDateClick?: (date: Date) => void;
}

export function AppointmentCalendar({ appointments = [], onDateClick }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (day: Date) => {
    return appointments?.filter((apt) => isSameDay(new Date(apt.startTime), day)) || [];
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  return (
    <div className="w-full bg-white rounded-lg border border-border/40 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toString()}
              onClick={() => onDateClick?.(day)}
              className={`
                min-h-24 p-1 rounded border cursor-pointer transition
                ${isCurrentMonth ? "bg-white" : "bg-muted/30"}
                ${isToday ? "border-primary bg-primary/5" : "border-border/40"}
                hover:border-primary/40
              `}
            >
              <div className={`text-xs font-semibold mb-1 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {format(day, "d")}
              </div>

              {/* Appointments */}
              <div className="space-y-0.5">
                {dayAppointments.slice(0, 2).map((apt) => (
                  <div
                    key={apt.id}
                    className={`
                      text-xs px-1 py-0.5 rounded truncate
                      ${apt.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : apt.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                      }
                    `}
                    title={`Cliente #${apt.clientId}`}
                  >
                    {format(new Date(apt.startTime), "HH:mm")}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayAppointments.length - 2} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
