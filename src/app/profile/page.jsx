'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../components/AuthProvider';
import { usersAPI } from '@/lib/api';
import { validateIndonesianPhone, formatPhoneForDisplay } from '@/utils/phoneValidation';
import Toast from '@/component/Toast';

export default function ProfilePage() {
  const { user: authUser, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // Original data from server
  const [originalData, setOriginalData] = useState({
    name: '',
    email: '',
    phone: '',
    updatedAt: null,
  });

  // Current form data
  const [user, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await usersAPI.getMe();
        const userData = response.user || response;
        
        const phoneFormatted = formatPhoneForDisplay(userData.phone || '');
        
        const initialData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: phoneFormatted,
        };

        setUserData(initialData);
        setOriginalData({
          ...initialData,
          updatedAt: userData.updatedAt || null,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      const phoneFormatted = formatPhoneForDisplay(authUser.phone || '');
      const initialData = {
        name: authUser.name || '',
        email: authUser.email || '',
        phone: phoneFormatted,
      };
      setUserData(initialData);
      setOriginalData({
        ...initialData,
        updatedAt: authUser.updatedAt || null,
      });
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, [authUser]);

  const showToast = (message, severity = 'info') => {
    setToast({ open: true, message, severity });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear errors when user starts typing
    if (name === 'name') {
      setNameError('');
    }
    if (name === 'phone') {
      setPhoneError('');
    }
    setError('');
    setSuccess('');

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Check if form has changes
  const hasChanges = () => {
    return (
      user.name.trim() !== originalData.name.trim() ||
      (user.phone || '') !== (originalData.phone || '')
    );
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;

    // Validate name
    if (!user.name || user.name.trim() === '') {
      setNameError('Full Name is required');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate phone
    if (user.phone) {
      const validation = validateIndonesianPhone(user.phone);
      if (!validation.isValid) {
        setPhoneError(validation.error);
        isValid = false;
      } else {
        setPhoneError('');
      }
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submit
    if (isSubmittingRef.current || saving) {
      return;
    }

    // Clear previous errors
    setError('');
    setSuccess('');
    setPhoneError('');
    setNameError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check if there are changes
    if (!hasChanges()) {
      showToast('No changes to save', 'info');
      return;
    }

    isSubmittingRef.current = true;
    setSaving(true);

    try {
      const phoneToValidate = user.phone;
      const validation = validateIndonesianPhone(phoneToValidate);
      const normalizedPhone = validation.normalized || phoneToValidate;

      const updateData = {
        name: user.name.trim(),
        phone: normalizedPhone,
      };

      const response = await usersAPI.updateMe(updateData);

      // Handle response format
      const updatedUser = response.data?.user || response.user || response;

      const phoneFormatted = formatPhoneForDisplay(updatedUser.phone || normalizedPhone);

      const newData = {
        name: updatedUser.name || user.name,
        email: updatedUser.email || user.email,
        phone: phoneFormatted,
      };

      setUserData(newData);
      setOriginalData({
        ...newData,
        updatedAt: updatedUser.updatedAt || new Date().toISOString(),
      });

      // Update user in context
      const newUserData = {
        ...authUser,
        ...updatedUser,
        phone: phoneFormatted,
      };
      setUser(newUserData);

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminUser', JSON.stringify(newUserData));
      }

      setSuccess('Profile updated successfully!');
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
      isSubmittingRef.current = false;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <main className="flex-1 min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
    }}>
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
      
      <div className="p-8 max-w-4xl mx-auto animate-fadeIn">
        <div className="card-premium p-8">
          {/* Header */}
          <div className="mb-8 border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-extrabold gradient-text mb-2">My Profile</h1>
            <p className="text-gray-500 font-medium">Manage your account information and settings</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Fields - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className={`w-full h-[50px] px-4 rounded-xl border-2 bg-gray-50 focus:bg-white transition-smooth outline-none ${
                    nameError 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-transparent focus:border-primary'
                  }`}
                  placeholder="Enter your name"
                />
                {nameError && <p className="text-sm text-red-500 mt-1 ml-1">{nameError}</p>}
              </div>

              <div className="form-group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  disabled
                  className="w-full h-[50px] px-4 rounded-xl border-2 border-transparent bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="email@example.com"
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">Email cannot be changed</p>
              </div>

              <div className="form-group md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  disabled={saving}
                  className={`w-full h-[50px] px-4 rounded-xl border-2 bg-gray-50 focus:bg-white transition-smooth outline-none ${
                    phoneError 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-transparent focus:border-primary'
                  }`}
                  placeholder="Enter your phone number (e.g., 081234567890)"
                />
                {phoneError ? (
                  <p className="text-sm text-red-500 mt-1 ml-1">{phoneError}</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1 ml-1">Format: 08xxxxxxxxxx or +62xxxxxxxxxxx</p>
                )}
              </div>
            </div>

            {/* Account Information Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                  <span className="text-sm text-gray-500 font-medium">Role</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold capitalize">
                    {authUser?.role || 'admin'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                  <span className="text-sm text-gray-500 font-medium">Status</span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 ${
                    authUser?.isVerified ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {authUser?.isVerified ? '✓ Verified' : '✗ Not Verified'}
                  </span>
                </div>
                {authUser?.createdAt && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <span className="text-sm text-gray-500 font-medium">Member Using</span>
                    <span className="text-sm text-gray-700 font-bold">
                      {new Date(authUser.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {originalData.updatedAt && (
                   <div className="flex items-center justify-between px-3 pt-2">
                    <span className="text-xs text-gray-400">Last profile update</span>
                    <span className="text-xs text-gray-500 font-medium">
                      {formatDate(originalData.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <Button
                type="button"
                className="!h-[50px] !px-8 !rounded-xl !text-gray-600 !font-bold hover:!bg-gray-100 transition-smooth"
                onClick={() => {
                  setUserData({
                    name: originalData.name,
                    email: originalData.email,
                    phone: originalData.phone,
                  });
                  setError('');
                  setSuccess('');
                  setNameError('');
                  setPhoneError('');
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-g !h-[50px] !px-8 !rounded-xl !font-bold !text-white shadow-lg hover:shadow-xl transition-smooth"
                disabled={saving || !hasChanges()}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
