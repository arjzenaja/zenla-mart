'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../components/AuthProvider';
import { usersAPI } from '@/lib/api';
import { validateIndonesianPhone, formatPhoneForDisplay } from '@/utils/phoneValidation';
import Toast from '@/component/Toast';
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { FiUser, FiSettings, FiMail, FiPhone } from "react-icons/fi";

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
      
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fadeIn">
          <div>
            <Breadcrumbs items={[{ label: "Profile" }]} />
            <h1 className="text-4xl font-extrabold gradient-text tracking-tight leading-tight mt-1">Admin Profile</h1>
            <p className="text-gray-500 mt-2 font-medium uppercase tracking-widest text-[11px] font-black">Manage your personal database identity</p>
          </div>
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Session</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Identity Card */}
          <div className="lg:col-span-1 space-y-8 animate-scaleIn">
            <div className="card-premium p-8 text-center relative overflow-hidden group shadow-premium border-gray-100/50">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-[2rem] bg-orange-50 flex items-center justify-center text-primary mx-auto mb-6 shadow-sm border border-orange-100 group-hover:scale-110 transition-transform duration-500">
                  <FiUser size={48} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">{user.name}</h2>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-8 bg-orange-50 py-1.5 rounded-full inline-block px-6">Administrator</p>
                
                <div className="space-y-4 pt-8 border-t border-gray-100">
                   <div className="flex items-center justify-between text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                      <span>Status</span>
                      <span className="text-green-500">Verified</span>
                   </div>
                   <div className="flex items-center justify-between text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                      <span>Registered</span>
                      <span className="text-gray-700 font-bold">{formatDate(user.createdAt)}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Configuration Card */}
          <div className="lg:col-span-2 animate-scaleIn" style={{ animationDelay: '100ms' }}>
            <div className="card-premium p-10 shadow-premium border-gray-100/50 min-h-full">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                    <FiSettings size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-gray-900">Identification Specs</h3>
                    <p className="text-sm text-gray-500 font-medium">Configure your core account parameters</p>
                 </div>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="mb-8 p-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-4 animate-fadeIn">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="font-bold text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-8 p-5 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center gap-4 animate-fadeIn">
                  <div className="w-2 h-2 rounded-full bg-green-500 anim-pulse"></div>
                  <span className="font-bold text-sm">{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Registered Email</label>
                    <div className="relative group/field">
                      <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full h-[60px] pl-14 pr-6 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-400 font-bold text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Full Identity</label>
                    <div className="relative group/field">
                      <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/field:text-primary transition-colors" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        className={`w-full h-[60px] pl-14 pr-6 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-gray-900 font-black text-sm uppercase tracking-widest placeholder:lowercase placeholder:font-medium placeholder:tracking-normal ${
                           nameError ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        placeholder="Update public name"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Contact Number</label>
                    <div className="relative group/field">
                      <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/field:text-primary transition-colors" size={18} />
                      <input
                        type="text"
                        name="phone"
                        value={user.phone}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full h-[60px] pl-14 pr-6 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-gray-700 font-mono font-bold text-sm"
                        placeholder="Update primary phone"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Security Protocol</span>
                     <span className="text-xs text-gray-500 font-medium italic">Authorized profile updates require session validation</span>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                      type="button"
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
                      className="h-[60px] px-8 rounded-2xl text-gray-500 font-black uppercase tracking-widest text-[11px] hover:bg-gray-50 transition-colors disabled:opacity-30"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !hasChanges()}
                      className="btn-g h-[60px] px-12 rounded-2xl flex items-center gap-4 justify-center disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <FiSettings className="group-hover:rotate-90 transition-transform duration-700" size={20} />
                      )}
                      <span className="font-black uppercase tracking-[0.2em] text-[11px]">Confirm Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
