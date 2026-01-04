import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, setHours, setMinutes, isBefore, isAfter, startOfDay, addMinutes } from "date-fns";
import { Calendar, Clock, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface TimeSlot {
  time: Date;
  available: boolean;
}

const SESSION_DURATION = 30;
const BUFFER_MINUTES = 10;
const MAX_APPOINTMENTS_PER_DAY = 3;

// Availability: Mon-Sun 3:00pm - 6:00pm
const AVAILABLE_HOURS = { start: 15, end: 18 }; // 3pm to 6pm

export default function Schedule() {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("studentId");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Get next 14 days
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      dates.push(startOfDay(addDays(today, i)));
    }
    return dates;
  }, []);

  // Fetch existing appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("scheduled_at, status")
        .in("status", ["scheduled", "confirmed"]);

      if (!error && data) {
        setExistingAppointments(data);
      }
      setIsLoading(false);
    };

    fetchAppointments();
  }, []);

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots: TimeSlot[] = [];
    const now = new Date();
    
    // Count appointments on selected date
    const appointmentsOnDate = existingAppointments.filter((apt) => {
      const aptDate = new Date(apt.scheduled_at);
      return format(aptDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
    });

    if (appointmentsOnDate.length >= MAX_APPOINTMENTS_PER_DAY) {
      return []; // No slots available
    }

    // Generate slots from 3pm to 5:30pm (last slot that ends by 6pm)
    for (let hour = AVAILABLE_HOURS.start; hour < AVAILABLE_HOURS.end; hour++) {
      for (let minute = 0; minute < 60; minute += SESSION_DURATION + BUFFER_MINUTES) {
        const slotTime = setMinutes(setHours(selectedDate, hour), minute);
        const slotEnd = addMinutes(slotTime, SESSION_DURATION);

        // Skip if slot ends after 6pm
        if (slotEnd.getHours() > AVAILABLE_HOURS.end || 
            (slotEnd.getHours() === AVAILABLE_HOURS.end && slotEnd.getMinutes() > 0)) {
          continue;
        }

        // Skip if slot is in the past
        if (isBefore(slotTime, now)) {
          continue;
        }

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some((apt) => {
          const aptStart = new Date(apt.scheduled_at);
          const aptEnd = addMinutes(aptStart, SESSION_DURATION + BUFFER_MINUTES);
          return (
            (isAfter(slotTime, aptStart) && isBefore(slotTime, aptEnd)) ||
            (isAfter(slotEnd, aptStart) && isBefore(slotEnd, aptEnd)) ||
            (isBefore(slotTime, aptStart) && isAfter(slotEnd, aptEnd)) ||
            slotTime.getTime() === aptStart.getTime()
          );
        });

        slots.push({
          time: slotTime,
          available: !hasConflict,
        });
      }
    }

    return slots;
  }, [selectedDate, existingAppointments]);

  const handleBookAppointment = async () => {
    if (!studentId || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          student_id: studentId,
          scheduled_at: selectedTime.toISOString(),
          duration_minutes: SESSION_DURATION,
          timezone: timezone,
          status: "scheduled",
        })
        .select()
        .single();

      if (error) throw error;

      // Update student status
      await supabase
        .from("students")
        .update({ lead_status: "scheduled" })
        .eq("id", studentId);

      setAppointmentId(data.id);
      setIsConfirmed(true);
      toast({
        title: "Appointment booked!",
        description: "You'll receive a confirmation email shortly.",
      });
    } catch (error: any) {
      toast({
        title: "Error booking appointment",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentId) {
    return (
      <PublicLayout>
        <section className="py-20">
          <div className="container max-w-lg text-center">
            <h1 className="text-2xl font-bold mb-4">Missing Information</h1>
            <p className="text-muted-foreground mb-6">
              Please complete the intake form first to schedule an appointment.
            </p>
            <Link to="/intake">
              <Button className="hero-gradient border-0 text-primary-foreground">
                Go to Intake Form
              </Button>
            </Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  if (isConfirmed) {
    return (
      <PublicLayout>
        <section className="py-20">
          <div className="container max-w-lg">
            <Card className="card-elevated border-0 text-center">
              <CardContent className="pt-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Appointment Confirmed!</h1>
                <p className="text-muted-foreground mb-6">
                  Your free reading screening session is scheduled for:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg mb-6">
                  <p className="font-semibold text-lg">
                    {selectedTime && format(selectedTime, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-primary font-medium">
                    {selectedTime && format(selectedTime, "h:mm a")} ({timezone})
                  </p>
                </div>
                <div className="space-y-4 text-left bg-secondary/30 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• You'll receive a confirmation email with the Zoom link</li>
                    <li>• Ensure you have a quiet space with a camera and microphone</li>
                    <li>• Have your child available for the 30-minute session</li>
                    <li>• A summary report will be sent within 48 hours after the session</li>
                  </ul>
                </div>
                <Link to="/">
                  <Button variant="outline">Return to Home</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="py-12 md:py-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Schedule Your Session</h1>
            <p className="text-muted-foreground">
              Choose a convenient date and time for your free 30-minute reading screening.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your timezone: {timezone}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Date Selection */}
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Select a Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {availableDates.map((date) => {
                    const appointmentsOnDate = existingAppointments.filter((apt) => {
                      const aptDate = new Date(apt.scheduled_at);
                      return format(aptDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
                    });
                    const isFull = appointmentsOnDate.length >= MAX_APPOINTMENTS_PER_DAY;
                    const isSelected = selectedDate && 
                      format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

                    return (
                      <Button
                        key={date.toISOString()}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-auto py-3 flex flex-col ${
                          isSelected ? "hero-gradient border-0 text-primary-foreground" : ""
                        }`}
                        disabled={isFull}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                      >
                        <span className="text-xs opacity-80">
                          {format(date, "EEE")}
                        </span>
                        <span className="font-semibold">
                          {format(date, "MMM d")}
                        </span>
                        {isFull && (
                          <span className="text-xs opacity-60">Full</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Select a Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <p className="text-muted-foreground text-center py-8">
                    Please select a date first
                  </p>
                ) : isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : timeSlots.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No available times on this date. Please select another date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTime && 
                        slot.time.getTime() === selectedTime.getTime();

                      return (
                        <Button
                          key={slot.time.toISOString()}
                          variant={isSelected ? "default" : "outline"}
                          className={isSelected ? "hero-gradient border-0 text-primary-foreground" : ""}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          {format(slot.time, "h:mm a")}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          {selectedDate && selectedTime && (
            <Card className="mt-8 card-elevated border-0">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected appointment:</p>
                    <p className="font-semibold">
                      {format(selectedTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="hero-gradient border-0 text-primary-foreground"
                    disabled={isSubmitting}
                    onClick={handleBookAppointment}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Confirm Appointment"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 text-center">
            <Link to="/intake">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Intake Form
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
