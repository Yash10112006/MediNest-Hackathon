import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material'

import {
  Edit,
  Email,
  Phone,
  LocationOn,
  Bloodtype,
  ContactEmergency
} from '@mui/icons-material'

import { updateProfile } from '../../features/patient/patientSlice'

export default function PatientInfo() {
  const dispatch = useDispatch()

  const profile = useSelector(
    state => state.patient.profile
  )

  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState(profile)

  const handleChange = event => {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const handleSave = () => {
    dispatch(updateProfile(form))
    setEditing(false)
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
      {/* Header */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={2}
        mb={4}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: '#0d9488',
              fontSize: 28,
              fontWeight: 700
            }}
          >
            {profile.fullName.charAt(0)}
          </Avatar>

          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
            >
              {profile.fullName}
            </Typography>

            <Chip
              label="Patient"
              size="small"
              sx={{
                mt: 0.5,
                color: '#0d9488',
                bgcolor: '#ccfbf1',
                fontWeight: 700
              }}
            />
          </Box>
        </Stack>

        {!editing ? (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setEditing(true)}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#0d9488'
            }}
          >
            Edit Profile
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                setForm(profile)
                setEditing(false)
              }}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                bgcolor: '#0d9488'
              }}
            >
              Save Changes
            </Button>
          </Stack>
        )}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            disabled={!editing}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={!editing}
            InputProps={{
              startAdornment: (
                <Email sx={{ mr: 1, color: 'text.secondary' }} />
              )
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={!editing}
            InputProps={{
              startAdornment: (
                <Phone sx={{ mr: 1, color: 'text.secondary' }} />
              )
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            disabled={!editing}
            InputLabelProps={{
              shrink: true
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            disabled={!editing}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Blood Group"
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            disabled={!editing}
            InputProps={{
              startAdornment: (
                <Bloodtype
                  sx={{
                    mr: 1,
                    color: '#e11d48'
                  }}
                />
              )
            }}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            disabled={!editing}
            InputProps={{
              startAdornment: (
                <LocationOn
                  sx={{
                    mr: 1,
                    color: '#0d9488'
                  }}
                />
              )
            }}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            label="Emergency Contact"
            name="emergencyContact"
            value={form.emergencyContact}
            onChange={handleChange}
            disabled={!editing}
            InputProps={{
              startAdornment: (
                <ContactEmergency
                  sx={{
                    mr: 1,
                    color: '#e11d48'
                  }}
                />
              )
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}