import { useSelector } from 'react-redux'

import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography
} from '@mui/material'

import {
  LocalHospital,
  Event,
  MedicalInformation
} from '@mui/icons-material'

export default function MedicalHistory() {
  const history = useSelector(
    state => state.patient.medicalHistory
  )

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
            bgcolor: '#ccfbf1',
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MedicalInformation />
        </Box>

        <Box>
          <Typography
            variant="h6"
            fontWeight={800}
          >
            Medical History
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Your recent healthcare activity
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={0}>
        {history.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              gap: 2,
              position: 'relative'
            }}
          >
            {/* Timeline */}

            <Box
              sx={{
                width: 42,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: '#0d9488',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}
              >
                <LocalHospital fontSize="small" />
              </Box>

              {index !== history.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    minHeight: 80,
                    bgcolor: '#ccfbf1'
                  }}
                />
              )}
            </Box>

            {/* Event */}

            <Box
              sx={{
                flex: 1,
                pb: 4
              }}
            >
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row'
                }}
                justifyContent="space-between"
                gap={1}
              >
                <Typography
                  fontWeight={800}
                >
                  {item.title}
                </Typography>

                <Chip
                  icon={<Event />}
                  label={item.date}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Typography
                variant="body2"
                color="primary"
                fontWeight={600}
                mt={0.5}
              >
                {item.doctor}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {item.facility}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Typography
                variant="body2"
                fontWeight={700}
              >
                {item.diagnosis}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mt={0.5}
              >
                {item.notes}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  )
}