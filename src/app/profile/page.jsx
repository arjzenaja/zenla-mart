'use client';

import { useState, useEffect } from 'react';
import { Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../components/AuthProvider';
import { adminAuthAPI } from '@/lib/api';
import { usersAPI } from '@/lib/api';

export default function ProfilePage() {
  const { user: authUser, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await adminAuthAPI.getMe();
        const userData = response.user || response;
        setUserData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      setUserData({
        name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
      });
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Update profile menggunakan usersAPI.updateMe
      const response = await usersAPI.updateMe({
        name: user.name,
        phone: user.phone,
        // Email biasanya tidak bisa diubah
      });

      // Handle response format
      const updatedUser = response.data?.user || response.user || response;

      // Update user di context
      const newUserData = {
        ...authUser,
        ...updatedUser,
      };
      setUser(newUserData);

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminUser', JSON.stringify(newUserData));
      }

      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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
    <div className="p-5 bg-[#f1f1f1] min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-[14px] text-gray-600">Manage your account information and settings</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert 
            severity="error" 
            className="mb-6 !rounded-md" 
            onClose={() => setError('')}
            sx={{ 
              '& .MuiAlert-message': { fontSize: '14px' },
              '& .MuiAlert-icon': { fontSize: '20px' }
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            className="mb-6 !rounded-md" 
            onClose={() => setSuccess('')}
            sx={{ 
              '& .MuiAlert-message': { fontSize: '14px' },
              '& .MuiAlert-icon': { fontSize: '20px' }
            }}
          >
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-[rgba(0,0,0,0.1)]">
            <div className="relative mb-4">
              <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
                <img
                  src="/profile.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="contained"
                size="small"
                className="!absolute bottom-0 right-0 !min-w-0 !p-2 !rounded-full !bg-primary !shadow-md hover:!bg-secondary"
                disabled
                sx={{ 
                  minWidth: '40px',
                  width: '40px',
                  height: '40px',
                  padding: 0
                }}
              >
                <span className="text-[18px]">📷</span>
              </Button>
            </div>
            <p className="text-[12px] text-gray-500">Click camera icon to change profile picture</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5 mb-6">
            <div>
              <label className="block text-[15px] text-gray-800 font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <TextField
                fullWidth
                name="name"
                value={user.name}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Enter your name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#D96F32',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '12px 14px',
                    fontSize: '14px',
                  },
                }}
              />
            </div>

            <div>
              <label className="block text-[15px] text-gray-800 font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <TextField
                fullWidth
                name="email"
                value={user.email}
                onChange={handleChange}
                required
                disabled
                variant="outlined"
                placeholder="Enter your email"
                helperText="Email cannot be changed"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '12px 14px',
                    fontSize: '14px',
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '12px',
                    marginTop: '4px',
                    color: '#666',
                  },
                }}
              />
            </div>

            <div>
              <label className="block text-[15px] text-gray-800 font-medium mb-2">
                Phone
              </label>
              <TextField
                fullWidth
                name="phone"
                value={user.phone}
                onChange={handleChange}
                variant="outlined"
                placeholder="Enter your phone number"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#D96F32',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '12px 14px',
                    fontSize: '14px',
                  },
                }}
              />
            </div>
          </div>

          {/* Account Information Section */}
          <div className="bg-[#f9f9f9] p-5 rounded-lg mb-6 border border-[rgba(0,0,0,0.05)]">
            <h3 className="text-[16px] font-semibold text-gray-800 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[rgba(0,0,0,0.05)]">
                <span className="text-[14px] text-gray-600 font-medium">Role</span>
                <span className="text-[14px] text-gray-800 font-semibold capitalize">
                  {authUser?.role || 'admin'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[rgba(0,0,0,0.05)]">
                <span className="text-[14px] text-gray-600 font-medium">Status</span>
                <span className={`text-[14px] font-semibold ${
                  authUser?.isVerified ? 'text-green-600' : 'text-red-600'
                }`}>
                  {authUser?.isVerified ? '✓ Verified' : '✗ Not Verified'}
                </span>
              </div>
              {authUser?.createdAt && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-[14px] text-gray-600 font-medium">Member since</span>
                  <span className="text-[14px] text-gray-800 font-semibold">
                    {new Date(authUser.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[rgba(0,0,0,0.1)]">
            <Button
              type="submit"
              variant="contained"
              className="btn-g !px-8 !py-2.5 !text-[15px] !font-semibold"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              className="!px-8 !py-2.5 !text-[15px] !font-semibold !border-gray-300 !text-gray-700 hover:!bg-gray-50"
              onClick={() => {
                setUserData({
                  name: authUser?.name || '',
                  email: authUser?.email || '',
                  phone: authUser?.phone || '',
                });
                setError('');
                setSuccess('');
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
