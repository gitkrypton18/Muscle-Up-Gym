import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

// Pages
import { LoginPage } from '@/pages/admin/LoginPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { CustomersPage } from '@/pages/admin/CustomersPage'
import { AddCustomerPage } from '@/pages/admin/AddCustomerPage'
import { CustomerDetailPage } from '@/pages/admin/CustomerDetailPage'
import { EditCustomerPage } from '@/pages/admin/EditCustomerPage'
import { RenewMembershipPage } from '@/pages/admin/RenewMembershipPage'
import { LeadsPage } from '@/pages/admin/LeadsPage'
import { SettingsPage } from '@/pages/admin/SettingsPage'
import { EarningsPage } from '@/pages/admin/EarningsPage'
import { ApprovalsPage } from '@/pages/admin/ApprovalsPage'
import { TestimonialsManager } from '@/pages/admin/TestimonialsManager'

// Public Pages
import { PublicLayout } from '@/components/layout/PublicLayout'
import { HomePage } from '@/pages/public/HomePage'
import { GalleryPage } from '@/pages/public/GalleryPage'
import { PlansPage } from '@/pages/public/PlansPage'
import { EnquiryPage } from '@/pages/public/EnquiryPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { TestimonialsPage } from '@/pages/public/TestimonialsPage'
import { ScrollToTop } from '@/components/shared/ScrollToTop'

const ProtectedRoute = () => {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-background"><LoadingSpinner /></div>
  
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="testimonials" element={<TestimonialsPage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="enquiry" element={<EnquiryPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="earnings" element={<EarningsPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/add" element={<AddCustomerPage />} />
                <Route path="customers/:id" element={<CustomerDetailPage />} />
                <Route path="customers/:id/edit" element={<EditCustomerPage />} />
                <Route path="customers/:id/renew" element={<RenewMembershipPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="approvals" element={<ApprovalsPage />} />
                <Route path="testimonials" element={<TestimonialsManager />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" theme="dark" richColors />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
