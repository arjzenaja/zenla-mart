'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TextField, Checkbox, FormControlLabel, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import Link from 'next/link'
import { addressAPI } from '@/lib/api'
import { isAuthenticated } from '@/utils/auth'
import { validateIndonesianPhone } from '@/utils/phoneValidation'
import { FiArrowLeft, FiMapPin, FiUser, FiPhone, FiHome } from 'react-icons/fi'
import Toast from '@/component/Toast'
import Container from '@/component/ui/Container'
import FormField from '@/component/ui/FormField'
import Button from '@/component/ui/Button'
import Skeleton from '@/component/ui/Skeleton'

const NewAddressPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" })
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    label: 'Home',
    isDefault: false
  })
  const [returnPath, setReturnPath] = useState('/checkout')

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    // Set return path from localStorage after mount
    if (typeof window !== 'undefined') {
      const storedPath = localStorage.getItem('addressReturnPath')
      if (storedPath) {
        setReturnPath(storedPath)
      }
    }
  }, [router])

  const showToast = (message, severity = "info") => {
    setToast({ open: true, message, severity });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear phone error when typing
    if (name === 'phone') {
      setPhoneError('')
    }
    setError('')
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      phone: value
    }))
    setPhoneError('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPhoneError('')

    // Validation
    if (!formData.name || !formData.phone || !formData.address || 
        !formData.city || !formData.province || !formData.postalCode) {
      setError('Please fill in all required fields')
      return
    }

    // Validate phone number
    const phoneValidation = validateIndonesianPhone(formData.phone)
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error)
      return
    }

    try {
      setLoading(true)
      
      // Use normalized phone number
      const addressData = {
        ...formData,
        phone: phoneValidation.normalized
      }
      
      await addressAPI.create(addressData)
      showToast('Address created successfully', 'success')
      
      // Small delay to show success toast
      setTimeout(() => {
        router.push(returnPath)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('addressReturnPath')
        }
      }, 500)
    } catch (error) {
      console.error('Error creating address:', error)
      const errorMessage = error.message || 'Failed to create address. Please try again.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-gray-100 py-8 min-h-screen">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <div className="mb-4">
            <Link href={returnPath}>
              <Button
                variant="text"
                className="!text-gray-600 !capitalize !px-0 hover:!text-primary"
                startIcon={<FiArrowLeft size={18} />}
              >
                Back
              </Button>
            </Link>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-md shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <FiMapPin className="text-primary" size={20} />
                </div>
                <div>
                  <h1 className="text-[24px] font-[600] text-gray-800">
                    Add New Address
                  </h1>
                  <p className="text-gray-600 text-[14px] mt-1">
                    Add a new delivery address for your orders
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {error && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Recipient Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <FiUser className="text-gray-500" size={18} />
                    <h3 className="text-[16px] font-[600] text-gray-700">Recipient Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Recipient Name" required>
                      <TextField
                        fullWidth
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        size="small"
                        className="input"
                      />
                    </FormField>

                    <FormField label="Phone Number" required error={phoneError}>
                      <TextField
                        fullWidth
                        name="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        required
                        variant="outlined"
                        type="tel"
                        size="small"
                        placeholder="08xxxxxxxxxx"
                        error={!!phoneError}
                        helperText={phoneError || 'Format: 08xxxxxxxxxx'}
                      />
                    </FormField>
                  </div>
                  
                  <FormField label="Address Label">
                    <FormControl fullWidth size="small">
                      <Select name="label" value={formData.label} onChange={handleChange}>
                        <MenuItem value="Home">Home</MenuItem>
                        <MenuItem value="Office">Office</MenuItem>
                        <MenuItem value="Custom">Custom</MenuItem>
                      </Select>
                    </FormControl>
                  </FormField>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <FiHome className="text-gray-500" size={18} />
                    <h3 className="text-[16px] font-[600] text-gray-700">Delivery Address</h3>
                  </div>

                  <div className="my-4">
                    <FormField label="Street Address" required>
                      <TextField
                        fullWidth
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        multiline
                        rows={3}
                        size="small"
                        placeholder="Enter your complete street address, building name, floor, etc."
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      size="small"
                      placeholder="e.g., Jakarta"
                    />

                    <TextField
                      fullWidth
                      label="Province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      size="small"
                      placeholder="e.g., DKI Jakarta"
                    />
                  </div>

                  <FormField label="Postal Code" required>
                    <TextField
                      fullWidth
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      size="small"
                      inputProps={{ maxLength: 10 }}
                      placeholder="e.g., 12345"
                    />
                  </FormField>
                </div>

                {/* Default Address Checkbox */}
                <div className="pt-2 pb-4">
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleChange}
                        className="!text-primary"
                      />
                    }
                    label={
                      <span className="text-[14px] text-gray-700">
                        Set as default address
                        <span className="text-gray-500 text-[12px] block mt-1">
                          This address will be used as default for future orders
                        </span>
                      </span>
                    }
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Link href={returnPath} className="flex-1">
                    <Button
                      variant="outlined"
                      className="w-full !border-gray-300 !text-gray-700 !capitalize !py-2.5 hover:!bg-gray-50"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="btn-g flex-1 !py-2.5 !capitalize"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      'Save Address'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-[14px] font-[600] text-blue-800 mb-1">Tips for accurate delivery</h4>
                <p className="text-[13px] text-blue-700">
                  Please provide complete and accurate address information to ensure your orders are delivered on time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </section>
  )
}

export default NewAddressPage
