/**
 * @copyright 2024 NguyenTrongNguyen
 * @license Apache-2.0
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Auth from './pages/Auth.tsx';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/auth', element: <Auth /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
