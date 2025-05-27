import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import { format, startOfWeek, addWeeks, subWeeks, addDays, isBefore, endOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api/slots';

const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingSlot, setUpdatingSlot] = useState(null); // time string
  const navigate = useNavigate();

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

  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleSlotToggle = (time) => {
    setUpdatingSlot(time);
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, time, available: !isSlotAvailable(time) })
    })
      .then(res => res.json())
      .then(data => {
        setSlots(data.slots);
        setUpdatingSlot(null);
      })
      .catch(() => setUpdatingSlot(null));
  };

  const isSlotAvailable = (time) => {
    if (!slots) return true;
    return slots[time] !== false;
  };

  // Don't allow navigation to past Sundays
  const today = new Date();
  const isPrevDisabled = isBefore(endOfDay(sunday), endOfDay(today));

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/');
  };

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        {/* Title intentionally left blank as per your last edit */}
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
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: updatingSlot === time ? 0.5 : 1
                  }}
                  onClick={() => updatingSlot ? null : handleSlotToggle(time)}
                >
                  {updatingSlot === time ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>{time} - {isSlotAvailable(time) ? 'Available' : 'Unavailable'}</>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminCalendar; 