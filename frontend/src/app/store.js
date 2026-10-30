import { configureStore } from '@reduxjs/toolkit'
import patientReducer from '../features/patient/patientSlice'

const store = configureStore({
  reducer: {
    patient: patientReducer
  }
})

export default store