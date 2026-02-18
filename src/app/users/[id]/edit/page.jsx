'use client';

import { useState, useEffect } from 'react';
import { Button, TextField, Alert, CircularProgress, Box, Divider } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { usersAPI } from '@/lib/api';
import { RiEdit2Line } from 'react-icons/ri';
import { MdOutlineArrowBack } from 'react-icons/md';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      // Check if userId exists
      if (!userId) {
        console.error('User ID is missing from route params');
        setError('User ID is missing. Please go back and try again.');
        setLoading(false);
        setNotFound(true);
        return;
      }

      console.log('Fetching user with ID:', userId);

      try {
        setLoading(true);
        setError('');
        setNotFound(false);
        
        let userData = null;
        
        // Try to fetch user by ID first
        try {
          const response = await usersAPI.getById(userId);
          console.log('User API Response (getById):', response);
          
          // Handle different response formats
          userData = response?.user || response?.data || response;
        } catch (getByIdError) {
          console.warn('getById failed, trying getAll as fallback:', getByIdError);
          
          // Fallback: fetch all users and find by ID
          try {
            const allUsersResponse = await usersAPI.getAll();
            const usersData = allUsersResponse?.users || allUsersResponse?.data?.users || allUsersResponse || [];
            const usersArray = Array.isArray(usersData) ? usersData : [];
            
            // Find user by ID (handle both string and number IDs)
            userData = usersArray.find(user => 
              user.id === userId || 
              user.id === String(userId) || 
              String(user.id) === String(userId)
            );
            
            console.log('Found user from getAll fallback:', userData ? 'Yes' : 'No');
          } catch (getAllError) {
            console.error('Both getById and getAll failed:', getAllError);
            throw getByIdError; // Throw original error
          }
        }
        
        if (!userData || !userData.id) {
          console.error('User data not found or invalid:', userData);
          setError(`User with ID "${userId}" not found. Please check if the user exists.`);
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        // Set form data
        setForm({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
        
        console.log('User data loaded successfully:', {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        
        // Check if it's a 404 or route not found error
        if (error.message?.includes('Route not found') || error.message?.includes('404') || error.message?.includes('not found')) {
          setError(`User with ID "${userId}" not found. The user may have been deleted or the ID is incorrect.`);
          setNotFound(true);
        } else {
          setError(error.message || 'Failed to load user data. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setSuccess('');

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving || !userId) return;

    // Validate form
    if (!form.name || form.name.trim() === '') {
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await usersAPI.update(userId, {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
      });

      setSuccess('User updated successfully!');
      setTimeout(() => {
        router.push('/users');
      }, 1500);
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.message || 'Failed to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="px-5 py-5">
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RiEdit2Line className="text-primary" size={24} />
              </div>
              <h2 className="text-[22px] text-gray-800 font-[700]">Edit User</h2>
            </div>
          </div>
          <div className="p-12">
            <div className="flex flex-col items-center justify-center py-10">
              <CircularProgress size={40} className="!text-primary mb-4" />
              <p className="text-gray-600 font-medium">Loading user data...</p>
              <p className="text-sm text-gray-400 mt-2">Please wait</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="px-5 py-5">
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <RiEdit2Line className="text-red-600" size={24} />
                </div>
                <h2 className="text-[22px] text-gray-800 font-[700]">Edit User</h2>
              </div>
              <Button
                onClick={() => router.push('/users')}
                variant="outlined"
                startIcon={<MdOutlineArrowBack size={18} />}
                className="!text-gray-700 !border-gray-300 !font-medium hover:!bg-gray-50"
              >
                Back to Users
              </Button>
            </div>
          </div>
          <div className="p-6">
            <Alert 
              severity="error" 
              className="!rounded-md !mb-5"
              icon={<FiUser size={20} />}
            >
              <div>
                <p className="font-semibold mb-1">User Not Found</p>
                <p className="text-sm">{error || `User with ID "${userId}" not found`}</p>
              </div>
            </Alert>
            <div className="flex justify-end">
              <Button
                variant="outlined"
                onClick={() => router.push('/users')}
                className="!text-gray-700 !border-gray-300 !font-medium !px-6 !py-2 hover:!bg-gray-50"
              >
                Back to Users
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RiEdit2Line className="text-primary" size={24} />
              </div>
              <div>
                <h2 className="text-[22px] text-gray-800 font-[700] flex items-center gap-2">
                  Edit User
                </h2>
                {userId && (
                  <p className="text-xs text-gray-500 mt-1 font-mono">ID: {userId}</p>
                )}
              </div>
            </div>
            <Button
              onClick={() => router.push('/users')}
              variant="outlined"
              startIcon={<MdOutlineArrowBack size={18} />}
              className="!text-gray-700 !border-gray-300 !font-medium hover:!bg-gray-50"
            >
              Back to Users
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {error && (
            <Alert 
              severity="error" 
              className="mb-5 !rounded-md" 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              className="mb-5 !rounded-md" 
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Form Fields */}
            <div className="space-y-5 mb-6">
              {/* Name Field */}
              <div>
                <label className="block text-[15px] text-gray-800 font-medium mb-2 flex items-center gap-2">
                  <FiUser size={16} className="text-gray-600" />
                  Name <span className="text-red-500">*</span>
                </label>
                <TextField
                  fullWidth
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  placeholder="Enter user name"
                  disabled={saving}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      backgroundColor: '#fff',
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#D96F32',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 14px',
                      fontSize: '14px',
                    },
                  }}
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-[15px] text-gray-800 font-medium mb-2 flex items-center gap-2">
                  <FiMail size={16} className="text-gray-600" />
                  Email
                </label>
                <TextField
                  fullWidth
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  variant="outlined"
                  disabled
                  helperText="Email cannot be changed"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      backgroundColor: '#f5f5f5',
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 14px',
                      fontSize: '14px',
                      cursor: 'not-allowed',
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: '12px',
                      marginTop: '4px',
                    },
                  }}
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-[15px] text-gray-800 font-medium mb-2 flex items-center gap-2">
                  <FiPhone size={16} className="text-gray-600" />
                  Phone Number
                </label>
                <TextField
                  fullWidth
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="081234567890"
                  disabled={saving}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      backgroundColor: '#fff',
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#D96F32',
                        borderWidth: '2px',
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

            <Divider className="!my-6" />

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outlined"
                onClick={() => router.push('/users')}
                disabled={saving}
                className="!text-gray-700 !border-gray-300 !font-medium !px-6 !py-2 hover:!bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || !form.name.trim()}
                className="!bg-primary hover:!bg-[#c85d28] !text-white !font-medium !px-6 !py-2 !shadow-sm"
                startIcon={saving ? <CircularProgress size={16} className="!text-white" /> : <RiEdit2Line size={18} />}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
