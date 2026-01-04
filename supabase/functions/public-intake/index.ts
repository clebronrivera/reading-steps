import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting store (per edge function instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = 5; // 5 requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(clientIP: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(clientIP);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

// Validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function validateString(str: string, minLen: number, maxLen: number): boolean {
  return typeof str === 'string' && str.trim().length >= minLen && str.length <= maxLen;
}

function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  // Basic XSS prevention - remove script tags and encode special chars
  return str
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

// Validate parent goal enum
const validParentGoals = ['school_support', 'tutoring_plan', 'evaluation_guidance', 'full_report'];

interface IntakePayload {
  type: 'intake';
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  studentName: string;
  studentDob: string;
  studentGrade: string;
  studentSchool?: string;
  languagesAtHome: string;
  // NEW: Expanded fields for Item #9
  elStatus?: boolean;
  speechLanguageHistory?: string;
  visionHearingStatus?: string;
  attendanceConcerns?: boolean;
  primaryConcerns: string[];
  schoolSupportsStatus: string[]; // Changed from single value to array
  interventionsTried?: string;
  parentObservations: string;
  parentGoal: string;
  consentScreening: boolean;
  consentStoreData: boolean;
  consentRecordZoom?: boolean;
  honeypot?: string; // Hidden field to catch bots
}

interface SchedulePayload {
  type: 'schedule';
  studentId: string;
  scheduledAt: string;
  timezone: string;
  honeypot?: string;
}

interface GetSlotsPayload {
  type: 'get_slots';
  startDate: string;
  endDate: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    console.log(`[public-intake] Request from IP: ${clientIP}`);

    // Create Supabase client with service role for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const requestType = body.type;

    // Handle get_slots request (no rate limiting needed for reads)
    if (requestType === 'get_slots') {
      const payload = body as GetSlotsPayload;
      
      if (!payload.startDate || !payload.endDate) {
        return new Response(
          JSON.stringify({ error: 'Start and end dates are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase.rpc('get_available_appointment_slots', {
        start_date: payload.startDate,
        end_date: payload.endDate
      });

      if (error) {
        console.error('[public-intake] Error fetching slots:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch available slots' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[public-intake] Returned ${data?.length || 0} booked slots`);
      return new Response(
        JSON.stringify({ slots: data || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit check for write operations
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      console.log(`[public-intake] Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.retryAfter)
          } 
        }
      );
    }

    // Handle intake request
    if (requestType === 'intake') {
      const payload = body as IntakePayload;

      // Honeypot check - bots will fill this hidden field
      if (payload.honeypot && payload.honeypot.trim() !== '') {
        console.log(`[public-intake] Bot detected via honeypot from IP: ${clientIP}`);
        // Return success to not alert bots
        return new Response(
          JSON.stringify({ success: true, studentId: 'fake-id' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate required fields
      if (!validateString(payload.parentName, 2, 100)) {
        return new Response(
          JSON.stringify({ error: 'Invalid parent name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!validateEmail(payload.parentEmail)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email address' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!validatePhone(payload.parentPhone)) {
        return new Response(
          JSON.stringify({ error: 'Invalid phone number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!validateString(payload.studentName, 2, 100)) {
        return new Response(
          JSON.stringify({ error: 'Invalid student name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!payload.studentDob || isNaN(Date.parse(payload.studentDob))) {
        return new Response(
          JSON.stringify({ error: 'Invalid date of birth' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!validateString(payload.studentGrade, 1, 50)) {
        return new Response(
          JSON.stringify({ error: 'Invalid grade' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!Array.isArray(payload.primaryConcerns) || payload.primaryConcerns.length === 0) {
        return new Response(
          JSON.stringify({ error: 'At least one concern is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!Array.isArray(payload.schoolSupportsStatus) || payload.schoolSupportsStatus.length === 0) {
        return new Response(
          JSON.stringify({ error: 'School supports selection is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!payload.parentGoal || !validParentGoals.includes(payload.parentGoal)) {
        return new Response(
          JSON.stringify({ error: 'Valid parent goal is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!payload.consentScreening || !payload.consentStoreData) {
        return new Response(
          JSON.stringify({ error: 'Required consents must be provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Sanitize inputs
      const sanitizedData = {
        parentName: sanitizeString(payload.parentName),
        parentEmail: payload.parentEmail.trim().toLowerCase(),
        parentPhone: sanitizeString(payload.parentPhone),
        studentName: sanitizeString(payload.studentName),
        studentDob: payload.studentDob,
        studentGrade: sanitizeString(payload.studentGrade),
        studentSchool: payload.studentSchool ? sanitizeString(payload.studentSchool) : null,
        languagesAtHome: sanitizeString(payload.languagesAtHome),
        // New fields
        elStatus: !!payload.elStatus,
        speechLanguageHistory: payload.speechLanguageHistory ? sanitizeString(payload.speechLanguageHistory).substring(0, 1000) : null,
        visionHearingStatus: payload.visionHearingStatus ? sanitizeString(payload.visionHearingStatus).substring(0, 500) : null,
        attendanceConcerns: !!payload.attendanceConcerns,
        primaryConcerns: payload.primaryConcerns.map(c => sanitizeString(c)),
        schoolSupportsStatus: payload.schoolSupportsStatus.map(s => sanitizeString(s)),
        interventionsTried: payload.interventionsTried ? sanitizeString(payload.interventionsTried).substring(0, 2000) : null,
        parentObservations: sanitizeString(payload.parentObservations).substring(0, 2000),
        parentGoal: payload.parentGoal,
        consentRecordZoom: !!payload.consentRecordZoom
      };

      // Create parent
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .insert({
          full_name: sanitizedData.parentName,
          email: sanitizedData.parentEmail,
          phone: sanitizedData.parentPhone,
        })
        .select('id')
        .single();

      if (parentError) {
        console.error('[public-intake] Error creating parent:', parentError);
        return new Response(
          JSON.stringify({ error: 'Failed to create intake record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create student with expanded fields
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          parent_id: parentData.id,
          full_name: sanitizedData.studentName,
          date_of_birth: sanitizedData.studentDob,
          grade: sanitizedData.studentGrade,
          school: sanitizedData.studentSchool,
          languages_at_home: sanitizedData.languagesAtHome.split(',').map(l => l.trim()).filter(Boolean),
          // New fields for Item #9
          el_status: sanitizedData.elStatus,
          speech_language_history: sanitizedData.speechLanguageHistory,
          vision_hearing_status: sanitizedData.visionHearingStatus,
          attendance_concerns: sanitizedData.attendanceConcerns,
          primary_concerns: sanitizedData.primaryConcerns,
          school_supports_status: sanitizedData.schoolSupportsStatus,
          interventions_tried: sanitizedData.interventionsTried,
          parent_observations: sanitizedData.parentObservations,
          parent_goal: sanitizedData.parentGoal,
          consent_screening: true,
          consent_store_data: true,
          consent_record_zoom: sanitizedData.consentRecordZoom,
        })
        .select('id')
        .single();

      if (studentError) {
        console.error('[public-intake] Error creating student:', studentError);
        return new Response(
          JSON.stringify({ error: 'Failed to create intake record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[public-intake] Created intake for student: ${studentData.id}`);
      return new Response(
        JSON.stringify({ success: true, studentId: studentData.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle schedule request
    if (requestType === 'schedule') {
      const payload = body as SchedulePayload;

      // Honeypot check
      if (payload.honeypot && payload.honeypot.trim() !== '') {
        console.log(`[public-intake] Bot detected via honeypot from IP: ${clientIP}`);
        return new Response(
          JSON.stringify({ success: true, appointmentId: 'fake-id' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate student ID is UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!payload.studentId || !uuidRegex.test(payload.studentId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid student reference' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate scheduled time
      if (!payload.scheduledAt || isNaN(Date.parse(payload.scheduledAt))) {
        return new Response(
          JSON.stringify({ error: 'Invalid appointment time' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify student exists
      const { data: studentExists, error: studentCheckError } = await supabase
        .from('students')
        .select('id')
        .eq('id', payload.studentId)
        .single();

      if (studentCheckError || !studentExists) {
        return new Response(
          JSON.stringify({ error: 'Invalid student reference' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if slot is available (prevent double-booking)
      const scheduledDate = new Date(payload.scheduledAt);
      const { data: existingAppt } = await supabase
        .from('appointments')
        .select('id')
        .eq('scheduled_at', scheduledDate.toISOString())
        .in('status', ['scheduled', 'confirmed'])
        .single();

      if (existingAppt) {
        return new Response(
          JSON.stringify({ error: 'This time slot is no longer available' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          student_id: payload.studentId,
          scheduled_at: scheduledDate.toISOString(),
          duration_minutes: 30,
          timezone: sanitizeString(payload.timezone || 'UTC'),
          status: 'scheduled',
        })
        .select('id')
        .single();

      if (appointmentError) {
        console.error('[public-intake] Error creating appointment:', appointmentError);
        return new Response(
          JSON.stringify({ error: 'Failed to create appointment' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update student status
      await supabase
        .from('students')
        .update({ lead_status: 'scheduled' })
        .eq('id', payload.studentId);

      console.log(`[public-intake] Created appointment: ${appointmentData.id} for student: ${payload.studentId}`);
      return new Response(
        JSON.stringify({ success: true, appointmentId: appointmentData.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[public-intake] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
