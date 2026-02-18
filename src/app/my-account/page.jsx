"use client";
import AccountSidebar from "@/component/AccountSidebar";
import { Button, TextField, Alert, CircularProgress } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { userAPI } from "@/lib/api";
import { isAuthenticated } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { validateIndonesianPhone, formatPhoneForDisplay } from "@/utils/phoneValidation";
import { useNotification } from "@/utils/useNotification";
import Container from "@/component/ui/Container";

const MyAccount = () => {
  const router = useRouter();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  // Original data from server
  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    updatedAt: null,
  });

  // Current form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await userAPI.getProfile();
      const userData = response.user || response;
      
      const phoneFormatted = formatPhoneForDisplay(userData.phone || "");
      
      const initialData = {
        name: userData.name || "",
        email: userData.email || "",
        phone: phoneFormatted,
        address: userData.address || "",
        city: userData.city || "",
        province: userData.province || "",
        postalCode: userData.postalCode || "",
      };

      setFormData(initialData);
      setOriginalData({
        ...initialData,
        updatedAt: userData.updatedAt || null,
      });
      setPhone(phoneFormatted);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile. Please try again.");
      showError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
    setError("");
    setSuccess("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (phoneValue) => {
    setPhone(phoneValue);
    setFormData((prev) => ({
      ...prev,
      phone: phoneValue,
    }));
    setErrors(prev => ({
      ...prev,
      phone: ""
    }));
    setError("");
    setSuccess("");
  };

  // Check if form has changes
  const hasChanges = () => {
    const currentPhone = phone || formData.phone || "";
    const originalPhone = originalData.phone || "";
    
    return (
      formData.name.trim() !== originalData.name.trim() ||
      currentPhone !== originalPhone ||
      formData.address.trim() !== originalData.address.trim() ||
      formData.city.trim() !== originalData.city.trim() ||
      formData.province.trim() !== originalData.province.trim() ||
      formData.postalCode.trim() !== originalData.postalCode.trim()
    );
  };

  // Check if profile is complete
  const isProfileComplete = () => {
    return (
      formData.name.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.province.trim() !== "" &&
      formData.postalCode.trim() !== ""
    );
  };

  // Calculate profile completion percentage
  const getProfileCompletionPercentage = () => {
    const requiredFields = [
      formData.name.trim() !== "",
      formData.phone.trim() !== "",
      formData.address.trim() !== "",
      formData.city.trim() !== "",
      formData.province.trim() !== "",
      formData.postalCode.trim() !== "",
    ];
    const completedFields = requiredFields.filter(Boolean).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Full Name is required";
    }

    // Validate phone
    if (!phone || phone.trim() === "") {
      newErrors.phone = "Phone Number is required";
    } else {
      const phoneToValidate = phone || formData.phone;
      const validation = validateIndonesianPhone(phoneToValidate);
      if (!validation.isValid) {
        newErrors.phone = validation.error;
      }
    }

    // Validate address
    if (!formData.address || formData.address.trim() === "") {
      newErrors.address = "Address is required";
    }

    // Validate city
    if (!formData.city || formData.city.trim() === "") {
      newErrors.city = "City is required";
    }

    // Validate province
    if (!formData.province || formData.province.trim() === "") {
      newErrors.province = "Province is required";
    }

    // Validate postal code
    if (!formData.postalCode || formData.postalCode.trim() === "") {
      newErrors.postalCode = "Postal Code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submit
    if (isSubmittingRef.current || saving) {
      return;
    }

    // Clear previous errors
    setError("");
    setSuccess("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check if there are changes
    if (!hasChanges()) {
      showInfo("Tidak ada perubahan untuk disimpan");
      return;
    }

    isSubmittingRef.current = true;
    setSaving(true);

    try {
      const phoneToValidate = phone || formData.phone;
      const validation = validateIndonesianPhone(phoneToValidate);
      const normalizedPhone = validation.normalized || phoneToValidate;

      const updateData = {
        name: formData.name.trim(),
        phone: normalizedPhone,
        address: formData.address.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        postalCode: formData.postalCode.trim(),
      };

      const response = await userAPI.updateProfile(updateData);
      const updatedUser = response.user || response;

      const phoneFormatted = formatPhoneForDisplay(updatedUser.phone || normalizedPhone);

      const newData = {
        name: updatedUser.name || formData.name,
        email: updatedUser.email || formData.email,
        phone: phoneFormatted,
        address: updatedUser.address || formData.address,
        city: updatedUser.city || formData.city,
        province: updatedUser.province || formData.province,
        postalCode: updatedUser.postalCode || formData.postalCode,
      };

      setFormData(newData);
      setOriginalData({
        ...newData,
        updatedAt: updatedUser.updatedAt || new Date().toISOString(),
      });
      setPhone(phoneFormatted);

      setSuccess("Profile updated successfully!");
      showSuccess("Profil berhasil diperbarui!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.message || "Failed to update profile. Please try again.";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSaving(false);
      isSubmittingRef.current = false;
    }
  };

  const handleChangePassword = () => {
    router.push("/forgot-password");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <section className="bg-gray-100 py-8 min-h-screen">
        <Container>
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            <div className="w-full md:w-64 lg:w-60 flex-shrink-0 mb-4 md:mb-0">
              <AccountSidebar />
            </div>
            <div className="flex-1 max-w-3xl">
              <div className="bg-white shadow-md rounded-xl p-8 border border-[rgba(148,163,184,0.25)]">
                <div className="flex items-center justify-center py-10">
                  <CircularProgress size={24} className="mr-3" />
                  <p className="text-gray-500">Loading profile...</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const completionPercentage = getProfileCompletionPercentage();
  const isComplete = isProfileComplete();

  return (
    <>
      <section className="bg-gray-100 py-8 min-h-screen">
        <Container>
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            <div className="w-full md:w-64 lg:w-60 flex-shrink-0 mb-4 md:mb-0">
              <AccountSidebar />
            </div>

            <div className="flex-1 max-w-3xl">
              <div className="bg-white shadow-md rounded-xl mb-5 border border-[rgba(148,163,184,0.25)] overflow-hidden">
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[rgba(148,163,184,0.25)] bg-gradient-to-r from-primary/5 via-white to-transparent">
                  <div className="info">
                    <h4 className="text-[18px] font-[600] text-gray-800">
                      My Profile
                    </h4>
                    <p className="text-[14px] text-gray-500">
                      Kelola data akun & alamat utama untuk mempercepat checkout
                    </p>
                  </div>

                  <Button
                    className="!text-primary !border !border-primary !capitalize !font-[600] !px-5"
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </Button>
                </div>

                {error && (
                  <div className="px-5 pt-4">
                    <Alert severity="error">{error}</Alert>
                  </div>
                )}

                {success && (
                  <div className="px-5 pt-4">
                    <Alert severity="success">{success}</Alert>
                  </div>
                )}

                {!isComplete && (
                  <div className="px-5 pt-4">
                    <Alert severity="warning" className="!bg-yellow-50 !border-yellow-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-yellow-800 mb-2">
                            ⚠️ Lengkapi data profil Anda untuk mempermudah proses checkout & pengiriman
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${completionPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-[12px] text-yellow-700 mt-1">
                            {completionPercentage}% Lengkap
                          </p>
                        </div>
                      </div>
                    </Alert>
                  </div>
                )}

                <form className="p-5 pt-4" onSubmit={handleSubmit}>
                  {/* Full Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="form-group">
                      <TextField
                        id="fullName"
                        name="name"
                        label="Full Name"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        error={!!errors.name}
                        helperText={errors.name}
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <TextField
                        id="email"
                        name="email"
                        label="Email"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        value={formData.email}
                        disabled
                        helperText="Email cannot be changed"
                        sx={{
                          "& .MuiInputBase-root": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="form-group w-full mb-5">
                    <label className="block text-[14px] font-[500] text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      value={phone}
                      onChange={handlePhoneChange}
                      defaultCountry="id"
                      disabled={saving}
                      inputStyle={{
                        width: "100%",
                        padding: "8px 14px",
                        borderColor: errors.phone ? "#d32f2f" : undefined,
                      }}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-[12px] mt-1 ml-2">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="form-group w-full mb-5">
                    <TextField
                      id="address"
                      name="address"
                      label="Address"
                      placeholder="Enter your complete address"
                      variant="outlined"
                      size="small"
                      className="w-full"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      error={!!errors.address}
                      helperText={errors.address || "Used for delivery"}
                      disabled={saving}
                      multiline
                      rows={3}
                    />
                  </div>

                  {/* City and Province */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="form-group">
                      <TextField
                        id="city"
                        name="city"
                        label="City"
                        placeholder="e.g., Jakarta"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        error={!!errors.city}
                        helperText={errors.city}
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <TextField
                        id="province"
                        name="province"
                        label="Province"
                        placeholder="e.g., DKI Jakarta"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        value={formData.province}
                        onChange={handleInputChange}
                        required
                        error={!!errors.province}
                        helperText={errors.province}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Postal Code */}
                  <div className="form-group w-full mb-5 md:w-1/2">
                    <TextField
                      id="postalCode"
                      name="postalCode"
                      label="Postal Code"
                      placeholder="e.g., 12345"
                      variant="outlined"
                      size="small"
                      className="w-full"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      error={!!errors.postalCode}
                      helperText={errors.postalCode}
                      disabled={saving}
                    />
                  </div>

                  {/* Last Updated Info */}
                  {originalData.updatedAt && (
                    <div className="mb-4 text-[12px] text-gray-500">
                      Last updated: {formatDate(originalData.updatedAt)}
                    </div>
                  )}

                  <div className="pt-2 border-t border-[rgba(148,163,184,0.25)] mt-2 flex justify-end">
                    <Button
                      type="submit"
                      className="btn-g !px-6"
                      disabled={saving || !hasChanges()}
                      startIcon={saving ? <CircularProgress size={16} /> : null}
                    >
                      {saving ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default MyAccount;
