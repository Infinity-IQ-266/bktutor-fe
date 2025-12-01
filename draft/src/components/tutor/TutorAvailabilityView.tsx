import { Clock, Save, RefreshCw, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import TutorAvailabilityTimetable from '../TutorAvailabilityTimetable';

export default function TutorAvailabilityView() {
  const [schedule, setSchedule] = useState<Record<string, string[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const currentUserEmail = localStorage.getItem('currentUserEmail');

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const userResult = await api.getUserByEmail(currentUserEmail!);
      if (userResult.user && userResult.user.availability) {
        setSchedule(userResult.user.availability);
      } else {
        // Initialize empty schedule if no availability data
        const emptySchedule = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        };
        setSchedule(emptySchedule);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    try {
      setSaving(true);
      const userResult = await api.getUserByEmail(currentUserEmail!);
      if (userResult.user) {
        await api.updateUser(userResult.user.id, { availability: schedule });
        setHasChanges(false);
        toast.success('Availability schedule saved successfully!');
        console.log('✅ Availability updated - students will now see the new schedule');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleSlotToggle = (day: string, slot: string) => {
    setSchedule((prev) => {
      const daySlots = prev[day] || [];
      const newSlots = daySlots.includes(slot)
        ? daySlots.filter((s) => s !== slot)
        : [...daySlots, slot];
      
      setHasChanges(true);
      return { ...prev, [day]: newSlots };
    });
  };

  const getTotalSlots = () => {
    return Object.values(schedule).reduce((total, slots) => total + slots.length, 0);
  };

  const resetChanges = () => {
    loadAvailability();
    setHasChanges(false);
    toast.info('Changes discarded');
  };

  const clearAllSlots = () => {
    if (!confirm('Are you sure you want to clear ALL availability slots?\n\nThis will remove all your available time slots. Students will not be able to book sessions with you until you set new availability.')) {
      return;
    }

    const emptySchedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    setSchedule(emptySchedule);
    setHasChanges(true);
    toast.info('All slots cleared. Click "Save Schedule" to apply changes.');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Availability Schedule</h1>
          <p className="text-muted-foreground">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Availability Schedule</h1>
        <p className="text-muted-foreground">Manage your available time slots for student bookings</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-[#0F2D52] to-[#1a4070] rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-3xl font-bold mb-1">{getTotalSlots()}</p>
              <p className="text-sm text-white/80">Total Available Slots Per Week</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="bg-red-500/20 border-red-300/30 text-white hover:bg-red-500/30"
              onClick={clearAllSlots}
              disabled={saving || getTotalSlots() === 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All Slots
            </Button>
            {hasChanges && (
              <Button 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={resetChanges}
                disabled={saving}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Discard Changes
              </Button>
            )}
            <Button 
              className="bg-white text-[#0F2D52] hover:bg-white/90"
              onClick={saveSchedule}
              disabled={!hasChanges || saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">How to manage your availability:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Click green slots</strong> to mark them as unavailable</li>
              <li><strong>Click gray slots</strong> to mark them as available</li>
              <li>Students can only book sessions during your available (green) time slots</li>
              <li>When you accept a session request, that time slot will be automatically removed from your availability</li>
              <li>If a scheduled session is cancelled, the time slot will be added back to your availability</li>
              <li>Don't forget to click <strong>"Save Schedule"</strong> to update your availability</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 text-yellow-900">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              You have unsaved changes. Click "Save Schedule" to update your availability.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Timetable */}
      <TutorAvailabilityTimetable 
        schedule={schedule}
        editable={true}
        onSlotToggle={handleSlotToggle}
      />

      {/* Tips */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-foreground mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          Best Practices
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p>• <strong>Be consistent:</strong> Set realistic time slots that you can maintain regularly</p>
            <p>• <strong>Buffer time:</strong> Leave gaps between sessions for preparation and breaks</p>
            <p>• <strong>Peak hours:</strong> Consider making yourself available during popular study times</p>
          </div>
          <div className="space-y-2">
            <p>• <strong>Update regularly:</strong> Keep your schedule current to help students plan ahead</p>
            <p>• <strong>Clear schedule:</strong> Your availability automatically updates when sessions are confirmed or cancelled</p>
            <p>• <strong>Student view:</strong> Students see your latest saved availability when booking sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
