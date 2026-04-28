import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useMobile";

interface Appointment {
  id?: number;
  startTime?: Date | string;
  endTime?: Date | string;
  clientId?: number;
  serviceId?: number;
  status?: string | null;
}

interface AppointmentCalendarProps {
  appointments: Appointment[] | undefined;
  onDateClick?: (date: Date) => void;
}

export function AppointmentCalendar({ appointments = [], onDateClick }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const isMobile = useIsMobile();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (day: Date) => {
    return appointments?.filter((apt) => apt.startTime && isSameDay(new Date(apt.startTime), day)) || [];
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="w-full bg-white rounded-[2rem] border-4 border-black p-2 md:p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2 text-center md:text-left">
        <h3 className="text-lg md:text-2xl font-black uppercase tracking-tighter">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            className="h-10 w-10 md:h-12 md:w-12 rounded-xl border-4 border-black hover:bg-primary/20 shadow-sm"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="h-10 w-10 md:h-12 md:w-12 rounded-xl border-4 border-black hover:bg-primary/20 shadow-sm"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
        {weekDays.map((day, idx) => (
          <div key={idx} className="text-center text-[10px] md:text-xs font-black text-black/40 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {daysInMonth.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const hasAppointments = dayAppointments.length > 0;
          const maxVisibleSlots = isMobile ? 1 : 3;

          return (
            <motion.div
              key={day.toString()}
              whileHover={{ scale: 1.02 }}
              onClick={() => onDateClick?.(day)}
              className={`
                min-h-[60px] md:min-h-[120px] p-1 md:p-2 rounded-xl md:rounded-2xl border-2 md:border-4 cursor-pointer transition-all flex flex-col relative
                ${isCurrentMonth ? "bg-white" : "bg-black/5 opacity-40"}
                ${isToday ? "border-primary bg-primary/5 ring-2 ring-primary/20" : hasAppointments ? "border-black bg-[#F8F7E5]" : "border-black/5"}
                hover:border-primary group
              `}
            >
              <div className={`text-[10px] md:text-sm font-black mb-1 ${isToday ? "text-primary drop-shadow-sm" : "text-black/30 group-hover:text-black transition-colors"}`}>
                {format(day, "d")}
              </div>

              {/* Appointments */}
              <div className="space-y-1 overflow-hidden">
                {dayAppointments.slice(0, maxVisibleSlots).map((apt) => (
                  <div
                    key={apt.id}
                    className={`
                      text-[8px] md:text-[10px] px-1 md:px-2 py-0.5 rounded-lg border border-black/10 font-bold truncate shadow-sm
                      ${apt.status === "completed"
                        ? "bg-emerald-500 text-white"
                        : apt.status === "cancelled"
                        ? "bg-red-500 text-white"
                        : "bg-primary text-black"
                      }
                    `}
                  >
                    {format(new Date(apt.startTime), "HH:mm")}
                  </div>
                ))}
                {dayAppointments.length > maxVisibleSlots && (
                  <div className="text-[8px] md:text-[10px] font-black text-black/40 px-1 uppercase tracking-tighter">
                    +{dayAppointments.length - maxVisibleSlots}
                  </div>
                )}
              </div>
              
              {isToday && (
                <div className="absolute top-1 right-1 md:top-2 md:right-2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse border border-black/10" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
