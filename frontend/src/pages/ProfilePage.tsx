import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { Address, ApiResponse } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [saving, setSaving] = useState(false);

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
    api
      .get<ApiResponse<Address[]>>('/users/addresses')
      .then((res) => setAddresses(res.data.data))
      .catch(() => {});
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/profile', { firstName, lastName });
      await refreshProfile();
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<ApiResponse<Address>>('/users/addresses', {
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: addresses.length === 0,
      });
      setAddresses((prev) => [...prev, res.data.data]);
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      toast.success('Address added');
    } catch {
      toast.error('Could not save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address removed');
    } catch {
      toast.error('Could not remove address');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-secondary-900">Account Profile</h1>
      <p className="mt-1 text-sm text-secondary-500">{user?.email}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Profile Info */}
        <form
          onSubmit={handleSaveProfile}
          className="h-fit rounded-xl border border-secondary-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-secondary-900">Personal Information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-secondary-700">First Name</label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary-700">Last Name</label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Addresses */}
        <div className="space-y-4">
          <div className="rounded-xl border border-secondary-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-secondary-900">Saved Addresses</h2>
            {addresses.length === 0 ? (
              <p className="mt-2 text-sm text-secondary-500">No saved addresses yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-start justify-between rounded-lg border border-secondary-200 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-secondary-900">{addr.street}</p>
                      <p className="text-secondary-500">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-secondary-500">{addr.country}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-secondary-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleAddAddress}
            className="rounded-xl border border-secondary-200 bg-white p-6"
          >
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-secondary-900">
              <Plus className="h-4 w-4" /> Add New Address
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="col-span-2 rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="mt-3 rounded-lg bg-secondary-900 px-4 py-2 text-xs font-semibold text-white hover:bg-secondary-800"
            >
              Save Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
