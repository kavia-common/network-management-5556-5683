import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DeviceList from '../components/Devices/DeviceList';
import DeviceForm from '../components/Devices/DeviceForm';
import DeviceDetail from '../components/Devices/DeviceDetail';

// PUBLIC_INTERFACE
export default function RoutesRoot() {
  /** Provides all application routes for devices management. */
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/devices" replace />} />
      <Route path="/devices" element={<DeviceList />} />
      <Route path="/devices/new" element={<DeviceForm mode="create" />} />
      <Route path="/devices/:id" element={<DeviceDetail />} />
      <Route path="/devices/:id/edit" element={<DeviceForm mode="edit" />} />
      <Route path="*" element={<Navigate to="/devices" replace />} />
    </Routes>
  );
}
