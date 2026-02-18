"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TextField, Checkbox, FormControlLabel, Alert, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import Link from 'next/link'
import { addressAPI } from '@/lib/api'
import { isAuthenticated } from '@/utils/auth'
import { validateIndonesianPhone, formatPhoneForDisplay } from '@/utils/phoneValidation'
import { FiArrowLeft, FiMapPin, FiUser, FiPhone, FiHome } from 'react-icons/fi'
import Toast from '@/component/Toast'
import Container from '@/component/ui/Container'
import FormField from '@/component/ui/FormField'
import Button from '@/component/ui/Button'
import Skeleton from '@/component/ui/Skeleton'

const EditAddressPage = () => {
  const router = useRouter()
  const params = useParams()
  const addressId = params?.addressId
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    
    if (addressId) {
      fetchAddress()
    }
  }, [addressId, router])

  const fetchAddress = async () => {
    try {
      setLoading(true)
      const response = await addressAPI.getById(addressId)
      const addressData = response.address || response
      
      // Format phone for display
      const phoneFormatted = formatPhoneForDisplay(addressData.phone || '')
      
      setFormData({
        name: addressData.name || '',
        phone: phoneFormatted,
        address: addressData.address || '',
        city: addressData.city || '',
        province: addressData.province || '',
        postalCode: addressData.postalCode || '',
        label: addressData.label || 'Home',
        isDefault: addressData.isDefault || false
      })
    } catch (error) {
      console.error('Error fetching address:', error)
      setError('Failed to load address. Please try again.')
      showToast('Failed to load address. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }
  
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
      setSaving(true)
      
      // Use normalized phone number
      const addressData = {
        ...formData,
        phone: phoneValidation.normalized
      }
      
      await addressAPI.update(addressId, addressData)
      showToast('Address updated successfully', 'success')
      
      // Small delay to show success toast
      setTimeout(() => {
        // Redirect back
        const returnPath = typeof window !== 'undefined' 
          ? localStorage.getItem('addressReturnPath') || '/address'
          : '/address'
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('addressReturnPath')
        }
        
        router.push(returnPath)
      }, 500)
    } catch (error) {
      console.error('Error updating address:', error)
      const errorMessage = error.message || 'Failed to update address. Please try again.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  const getReturnPath = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('addressReturnPath') || '/address'
    }
    return '/address'
  }

  if (loading) {
    return (
      <section className="bg-gray-100 py-8 min-h-screen">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="card">
              <Skeleton height="20px" width="40%" style={{ marginBottom: 8 }} />
              <Skeleton height="14px" width="60%" style={{ marginBottom: 16 }} />
              <Skeleton height="220px" width="100%" />
            </div>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="bg-gray-100 py-8 min-h-screen">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <div className="mb-4">
            <Link href={getReturnPath()}>
              <Button
                variant="text"
                className="!text-gray-600 !capitalize !px-0 hover:!text-primary"
              >
                <FiArrowLeft size={18} className="mr-2" />
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
                    Edit Address
                  </h1>
                  <p className="text-gray-600 text-[14px] mt-1">
                    Update your delivery address
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {error && (
                <div className="mb-5">
                  <Alert severity="error">{error}</Alert>
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
                  <Link href={getReturnPath()} className="flex-1">
                    <Button className="!border-gray-300 !text-gray-700" disabled={saving}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" loading={saving} full>
                    {saving ? 'Updating...' : 'Update Address'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Container>

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

export default EditAddressPage
