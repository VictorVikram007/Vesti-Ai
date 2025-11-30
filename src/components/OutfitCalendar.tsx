import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWardrobe } from '@/context/WardrobeContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Sparkles, Plus, Trash2, Edit } from 'lucide-react';

interface OutfitCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlannedOutfit {
  id: string;
  date: string;
  outfitId: string;
  eventType: string;
  location?: string;
  notes?: string;
  weather?: string;
}

export const OutfitCalendar: React.FC<OutfitCalendarProps> = ({
  open,
  onOpenChange
}) => {
  const { outfits, addCalendarEvent, calendarEvents } = useWardrobe();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedOutfit, setSelectedOutfit] = useState('');
  const [eventType, setEventType] = useState('casual');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [plannedOutfits, setPlannedOutfits] = useState<PlannedOutfit[]>([]);
  const [editingOutfit, setEditingOutfit] = useState<PlannedOutfit | null>(null);

  const eventTypes = [
    { id: 'casual', label: 'Casual', icon: '😊' },
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'formal', label: 'Formal', icon: '🎩' },
    { id: 'party', label: 'Party', icon: '🎉' },
    { id: 'date', label: 'Date Night', icon: '💕' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'sport', label: 'Sport', icon: '🏃' },
    { id: 'creative', label: 'Creative', icon: '🎨' }
  ];

  // Load planned outfits from calendar events
  useEffect(() => {
    const planned = calendarEvents
      .filter(event => event.outfitId)
      .map(event => ({
        id: event.id,
        date: event.date.toISOString().split('T')[0],
        outfitId: event.outfitId!,
        eventType: event.eventType,
        location: event.location,
        notes: event.notes,
        weather: event.weather
      }));
    setPlannedOutfits(planned);
  }, [calendarEvents]);

  const handlePlanOutfit = () => {
    if (!selectedDate || !selectedOutfit) {
      toast({
        title: "Missing information",
        description: "Please select a date and outfit.",
        variant: "destructive"
      });
      return;
    }

    const outfit = outfits.find(o => o.id === selectedOutfit);
    if (!outfit) return;

    const newPlannedOutfit: PlannedOutfit = {
      id: Date.now().toString(),
      date: selectedDate,
      outfitId: selectedOutfit,
      eventType,
      location,
      notes
    };

    // Add to calendar events
    addCalendarEvent({
      date: new Date(selectedDate),
      eventType,
      outfitId: selectedOutfit,
      location,
      notes,
      weather: 'sunny' // Default weather
    });

    setPlannedOutfits(prev => [...prev, newPlannedOutfit]);
    
    toast({
      title: "Outfit planned!",
      description: `${outfit.name} is now scheduled for ${new Date(selectedDate).toLocaleDateString()}`
    });

    // Reset form
    setSelectedDate('');
    setSelectedOutfit('');
    setEventType('casual');
    setLocation('');
    setNotes('');
  };

  const handleEditOutfit = (outfit: PlannedOutfit) => {
    setEditingOutfit(outfit);
    setSelectedDate(outfit.date);
    setSelectedOutfit(outfit.outfitId);
    setEventType(outfit.eventType);
    setLocation(outfit.location || '');
    setNotes(outfit.notes || '');
  };

  const handleUpdateOutfit = () => {
    if (!editingOutfit) return;

    // Update the planned outfit
    setPlannedOutfits(prev => prev.map(o => 
      o.id === editingOutfit.id 
        ? {
            ...o,
            date: selectedDate,
            outfitId: selectedOutfit,
            eventType,
            location,
            notes
          }
        : o
    ));

    toast({
      title: "Outfit updated!",
      description: "Your planned outfit has been updated."
    });

    // Reset form
    setEditingOutfit(null);
    setSelectedDate('');
    setSelectedOutfit('');
    setEventType('casual');
    setLocation('');
    setNotes('');
  };

  const handleDeleteOutfit = (outfitId: string) => {
    setPlannedOutfits(prev => prev.filter(o => o.id !== outfitId));
    toast({
      title: "Outfit removed",
      description: "The planned outfit has been removed from your calendar."
    });
  };

  const getEventIcon = (eventType: string) => {
    const event = eventTypes.find(e => e.id === eventType);
    return event?.icon || '📅';
  };

  const getEventLabel = (eventType: string) => {
    const event = eventTypes.find(e => e.id === eventType);
    return event?.label || 'Event';
  };

  // Group planned outfits by date
  const groupedOutfits = plannedOutfits.reduce((acc, outfit) => {
    if (!acc[outfit.date]) {
      acc[outfit.date] = [];
    }
    acc[outfit.date].push(outfit);
    return acc;
  }, {} as Record<string, PlannedOutfit[]>);

  const sortedDates = Object.keys(groupedOutfits).sort();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-wardrobe-teal" />
            Plan Your Outfits
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Planning Form */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {editingOutfit ? 'Edit Planned Outfit' : 'Plan New Outfit'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="outfit">Select Outfit</Label>
                  <Select value={selectedOutfit} onValueChange={setSelectedOutfit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an outfit" />
                    </SelectTrigger>
                    <SelectContent>
                      {outfits.map(outfit => (
                        <SelectItem key={outfit.id} value={outfit.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                              {outfit.items.length}
                            </div>
                            {outfit.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Office, Restaurant, Park"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any special requirements or notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button
                  onClick={editingOutfit ? handleUpdateOutfit : handlePlanOutfit}
                  disabled={!selectedDate || !selectedOutfit}
                  className="w-full bg-wardrobe-teal hover:bg-wardrobe-teal/90"
                >
                  {editingOutfit ? 'Update Outfit' : 'Plan Outfit'}
                </Button>

                {editingOutfit && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingOutfit(null);
                      setSelectedDate('');
                      setSelectedOutfit('');
                      setEventType('casual');
                      setLocation('');
                      setNotes('');
                    }}
                    className="w-full"
                  >
                    Cancel Edit
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Planned Outfits</p>
                    <p className="font-semibold">{plannedOutfits.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available Outfits</p>
                    <p className="font-semibold">{outfits.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Planned Outfits Calendar */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Your Planned Outfits
            </h3>

            {sortedDates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No outfits planned yet</p>
                  <p className="text-sm text-muted-foreground">Start planning your looks for upcoming events!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedDates.map(date => (
                  <Card key={date}>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {groupedOutfits[date].map(outfit => {
                          const outfitData = outfits.find(o => o.id === outfit.outfitId);
                          return outfitData ? (
                            <div key={outfit.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-xs font-medium">
                                  {outfitData.items.length}
                                </div>
                                <div>
                                  <p className="font-medium">{outfitData.name}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{getEventIcon(outfit.eventType)}</span>
                                    <span>{getEventLabel(outfit.eventType)}</span>
                                    {outfit.location && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {outfit.location}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditOutfit(outfit)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteOutfit(outfit.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
