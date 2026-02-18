"use client";
import AccountSidebar from "@/component/AccountSidebar";
import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { addressAPI } from "@/lib/api";
import { isAuthenticated } from "@/utils/auth";
import AddressCard from "@/component/AddressCard";
import Toast from "@/component/Toast";
import Container from '@/component/ui/Container'
import Button from '@/component/ui/Button'
import ModalConfirm from '@/component/ui/ModalConfirm'
import Skeleton from '@/component/ui/Skeleton'

const MAX_ADDRESSES = 5;

const Address = () => {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getAll();
      const addressesData = response.addresses || response || [];
      // Sort: default first, then by createdAt
      const sorted = addressesData.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      setAddresses(sorted);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showToast("Failed to load addresses. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, severity = "info") => {
    setToast({ open: true, message, severity });
  };

  const handleAddAddress = () => {
    if (addresses.length >= MAX_ADDRESSES) {
      showToast(`Maximum ${MAX_ADDRESSES} addresses allowed. Please delete an address first.`, "warning");
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('addressReturnPath', '/address');
    }
    router.push('/addresses/new');
  };

  const handleEdit = (addressId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('addressReturnPath', '/address');
    }
    router.push(`/addresses/edit/${addressId}`);
  };

  const handleDeleteClick = (addressId) => {
    setAddressToDelete(addressId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    try {
      setDeleting(true);
      await addressAPI.delete(addressToDelete);
      setAddresses(addresses.filter(addr => addr.id !== addressToDelete));
      showToast("Address deleted successfully", "success");
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    } catch (error) {
      console.error("Error deleting address:", error);
      showToast(error.message || "Failed to delete address. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAddressToDelete(null);
  };

  const handleSetDefault = async (addressId) => {
    try {
      setSettingDefault(addressId);
      await addressAPI.setDefault(addressId);
      // Update local state
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));
      showToast("Default address updated successfully", "success");
    } catch (error) {
      console.error("Error setting default address:", error);
      showToast(error.message || "Failed to set default address. Please try again.", "error");
    } finally {
      setSettingDefault(null);
    }
  };

  if (loading) {
    return (
      <section className="bg-gray-100 py-8">
        <Container>
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            <div className="w-full md:w-64 lg:w-60 flex-shrink-0 mb-4 md:mb-0">
              <AccountSidebar />
            </div>
            <div className="flex-1">
              <div className="card">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Skeleton height="20px" width="50%" style={{ marginBottom: 12 }} />
                    <Skeleton height="14px" width="40%" style={{ marginBottom: 18 }} />
                    <Skeleton height="120px" width="100%" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const canAddMore = addresses.length < MAX_ADDRESSES;

  return (
    <>
      <section className="bg-gray-100 py-8">
        <Container>
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            <div className="w-full md:w-64 lg:w-60 flex-shrink-0 mb-4 md:mb-0">
              <AccountSidebar />
            </div>

            <div className="flex-1">
              {/* Toast Notification - Moved here to be inline */}
              <Toast
                open={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={() => setToast({ ...toast, open: false })}
              />

              <div className="card mb-5">
                <div className="p-4 flex items-center justify-between border-b-[1px] border-[rgba(0,0,0,0.05)]">
                  <div className="info">
                    <h4 className="text-[18px] font-[600] text-gray-700">My Addresses</h4>
                    <p className="text-[15px] text-gray-500">Manage your delivery addresses ({addresses.length}/{MAX_ADDRESSES})</p>
                  </div>

                  <Button onClick={handleAddAddress} disabled={!canAddMore} className="!px-4">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <FiPlus size={16} /> Add Address
                    </span>
                  </Button>
                </div>

                {addresses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="mb-4">
                      <FiPlus size={48} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-[16px] mb-2 font-medium">No addresses yet</p>
                    <p className="text-gray-400 text-[14px] mb-6 text-center max-w-md">Add your first delivery address to get started. You can add up to {MAX_ADDRESSES} addresses.</p>
                    <Button onClick={handleAddAddress}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <FiPlus size={18} /> Add Your First Address
                      </span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 p-5">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        isDefault={address.isDefault}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onSetDefault={handleSetDefault}
                      />
                    ))}

                    {!canAddMore && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800"><strong>Limit reached:</strong> You have reached the maximum of {MAX_ADDRESSES} addresses. Please delete an address to add a new one.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Delete Confirmation Modal (custom) */}
      <ModalConfirm
        open={deleteDialogOpen}
        title="Delete Address?"
        message="Are you sure you want to delete this address? This action cannot be undone."
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        loading={deleting}
        cancelDisabled={deleting}
      />

    </>
  );
};

export default Address;
