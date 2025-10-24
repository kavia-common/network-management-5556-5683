import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Spinner from '../components/Common/Spinner';

const DeviceList = lazy(() => import('../components/Devices/DeviceList'));
const DeviceForm = lazy(() => import('../components/Devices/DeviceForm'));
const DeviceDetail = lazy(() => import('../components/Devices/DeviceDetail'));

// PUBLIC_INTERFACE
export default function RoutesRoot() {
  /** Provides all application routes for devices management. */
  return (
    <Suspense fallback={<Spinner label="Loading page..." />}>
      <Routes>
        <Route path="/" element={<Navigate to="/devices" replace />} />
        <Route path="/devices" element={<DeviceList />} />
        <Route path="/devices/new" element={<DeviceForm mode="create" />} />
        <Route path="/devices/:id" element={<DeviceDetail />} />
        <Route path="/devices/:id/edit" element={<DeviceForm mode="edit" />} />
        <Route path="*" element={<Navigate to="/devices" replace />} />
      </Routes>
    </Suspense>
  );
}
