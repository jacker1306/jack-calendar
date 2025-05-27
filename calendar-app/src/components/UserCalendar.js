import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import { format, startOfWeek, addWeeks, subWeeks, addDays, isBefore, endOfDay } from 'date-fns';

const API_URL = '/api/slots';

const UserCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState(null);
  const [loading, setLoading] = useState(false);

  // Always get Sunday of the current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as start
  const sunday = addDays(weekStart, 6);
  const dateStr = format(sunday, 'yyyy-MM-dd');

  // Generate time slots from 10 AM to 6 PM
  const timeSlots = Array.from({ length: 32 }, (_, i) => {
    const hour = Math.floor(i / 4) + 10;
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        setSlots(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dateStr]);

  const isSlotAvailable = (time) => {
    if (!slots) return true;
    return slots[time] !== false;
  };

  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  // Don't allow navigation to past Sundays
  const today = new Date();
  const isPrevDisabled = isBefore(endOfDay(sunday), endOfDay(today));

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Thấy cái nào Available thì chọn nha. Iu!
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
          <Typography variant="h6">
            {format(sunday, 'EEEE, MMMM d, yyyy')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
            <Button variant="contained" onClick={handlePrevWeek} sx={{ mr: { xs: 1, sm: 2 } }} disabled={isPrevDisabled}>
              Previous Week
            </Button>
            <Button variant="contained" onClick={handleNextWeek}>
              Next Week
            </Button>
          </Box>
        </Box>
        <Box sx={{ width: '100%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)'
                },
                gap: 2,
              }}
            >
              {timeSlots.map((time) => (
                <Box
                  key={time}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    height: 48,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isSlotAvailable(time) ? '#C8E6C9' : '#FFCDD2',
                    color: isSlotAvailable(time) ? 'success.dark' : 'error.dark',
                    fontWeight: 500,
                    fontSize: 18,
                  }}
                >
                  {time} - {isSlotAvailable(time) ? 'Available' : 'Unavailable'}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
      {/* Flappy Bird Game Embed */}
      <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <iframe
          title="Flappy Bird"
          src="https://flappybird.io/"
          width="375"
          height="500"
          style={{ border: 'none', borderRadius: 8 }}
          allow="autoplay; fullscreen"
        />
      </Box>
    </Box>
  );
};

export default UserCalendar; 
