import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material'

import {
  CalendarMonth,
  Schedule,
  Add,
  Cancel
} from '@mui/icons-material'

import {
  addAppointment,
  cancelAppointment
} from '../../features/patient/patientSlice'

const doctors = [
  {
    name: 'Dr. Ananya Sharma',
    specialty: 'General Physician'
  },
  {
    name: 'Dr. Rahul Verma',
    specialty: 'Internal Medicine'
  },
  {
    name: 'Dr. Priya Mehta',
    specialty: 'Pediatrics'
  }
]

const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00'
]

export default function AppointmentScheduler() {
  const dispatch = useDispatch()

  const appointments = useSelector(
    state => state.patient.appointments
  )

  const [doctor, setDoctor] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')

  const [message, setMessage] = useState('')

  const handleSchedule = event => {
    event.preventDefault()

    if (!doctor || !date || !time || !reason) {
      setMessage('Please complete all appointment fields.')
      return
    }

    const selectedDoctor = doctors.find(
      item => item.name === doctor
    )

    dispatch(
      addAppointment({
        doctor,
        specialty: selectedDoctor?.specialty || '',
        date,
        time,
        reason
      })
    )

    setDoctor('')
    setDate('')
    setTime('')
    setReason('')

    setMessage('Appointment scheduled successfully.')
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 2.5, md: 4 }
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        mb={3}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            bgcolor: '#dbeafe',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CalendarMonth />
        </Box>

        <Box>
          <Typography
            variant="h6"
            fontWeight={800}
          >
            Book Appointment
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Schedule a consultation with a doctor
          </Typography>
        </Box>
      </Stack>

      {message && (
        <Alert
          severity={
            message.includes('successfully')
              ? 'success'
              : 'warning'
          }
          sx={{
            mb: 3,
            borderRadius: 2
          }}
        >
          {message}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSchedule}
      >
        <Stack spacing={2}>
          <TextField
            select
            fullWidth
            label="Select Doctor"
            value={doctor}
            onChange={e => setDoctor(e.target.value)}
          >
            {doctors.map(item => (
              <MenuItem
                key={item.name}
                value={item.name}
              >
                <Box>
                  <Typography fontWeight={600}>
                    {item.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {item.specialty}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row'
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              type="date"
              label="Appointment Date"
              value={date}
              onChange={e => setDate(e.target.value)}
              InputLabelProps={{
                shrink: true
              }}
              inputProps={{
                min: new Date()
                  .toISOString()
                  .split('T')[0]
              }}
            />

            <TextField
              select
              fullWidth
              label="Time"
              value={time}
              onChange={e => setTime(e.target.value)}
            >
              {timeSlots.map(slot => (
                <MenuItem
                  key={slot}
                  value={slot}
                >
                  {slot}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Reason for Visit"
            placeholder="Describe your symptoms or reason for consultation..."
            value={reason}
            onChange={e => setReason(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<Add />}
            sx={{
              alignSelf: 'flex-start',
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 800,
              bgcolor: '#0d9488',
              px: 3,
              '&:hover': {
                bgcolor: '#0f766e'
              }
            }}
          >
            Schedule Appointment
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography
        variant="h6"
        fontWeight={800}
        mb={2}
      >
        Upcoming Appointments
      </Typography>

      <Stack spacing={1.5}>
        {appointments.map(appointment => (
          <Box
            key={appointment.id}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor:
                appointment.status === 'Cancelled'
                  ? '#fff1f2'
                  : '#f8fafc'
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                sm: 'row'
              }}
              justifyContent="space-between"
              gap={2}
            >
              <Box>
                <Typography fontWeight={800}>
                  {appointment.doctor}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {appointment.specialty}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  mt={1}
                >
                  <Chip
                    icon={<CalendarMonth />}
                    label={appointment.date}
                    size="small"
                  />

                  <Chip
                    icon={<Schedule />}
                    label={appointment.time}
                    size="small"
                  />
                </Stack>
              </Box>

              <Box>
                {appointment.status === 'Upcoming' && (
                  <Button
                    color="error"
                    size="small"
                    startIcon={<Cancel />}
                    onClick={() =>
                      dispatch(
                        cancelAppointment(
                          appointment.id
                        )
                      )
                    }
                    sx={{
                      textTransform: 'none'
                    }}
                  >
                    Cancel
                  </Button>
                )}

                {appointment.status === 'Cancelled' && (
                  <Chip
                    label="Cancelled"
                    color="error"
                    size="small"
                  />
                )}
              </Box>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={1.5}
            >
              {appointment.reason}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  )
}