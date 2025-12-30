import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import "./profile.css";

const Profile = () => {
  const { user: ctxUser, setUser, loading } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    dob: "",
    emailNotifications: true,
  });

  const normalizeUser = (u) => {
    if (!u) return null;
    if (u.data?.user) return u.data.user;
    if (u.user) return u.user;
    return u;
  };
  useEffect(() => {
    const u = normalizeUser(ctxUser);
    if (u) {
      setProfileData((prev) => ({
        fullName: u.name || prev.fullName,
        email: u.email || prev.email,
        mobileNumber: u.mobileNumber || prev.mobileNumber || "",
        dob: u.dob ? u.dob.split("T")[0] : prev.dob || "",
        emailNotifications:
          u.preferences?.emailNotifications ?? prev.emailNotifications,
      }));
    }
  }, [ctxUser]);

  if (loading) {
    return (
      <div className="profile-loading container text-center my-6">
        <div
          className="spinner-border text-primary"
          role="status"
          aria-hidden="true"
        />
        <div className="mt-2">Loading profile...</div>
      </div>
    );
  }

  const fieldDisabled = !isEditing;

  const handleProfileChange = (e) => {
    const { id, value, type, checked } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const mappedProfileData = {
        name: profileData.fullName,
        mobileNumber: profileData.mobileNumber,
        dob: profileData.dob,
        preferences: {
          ...ctxUser.preferences,
          emailNotifications: profileData.emailNotifications,
        },
      };

      const res = await fetch("http://localhost:8000/api/v1/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(mappedProfileData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save profile");

      const updatedUser = data?.data?.user || data?.user;
      if (updatedUser && setUser) setUser(updatedUser);

      alert("Profile & preferences saved successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Save profile error:", err);
      alert(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container profile-container my-4 pt-4">
      <header className="profile-header text-center mb-4">
        <h1 className="h1">Account Details</h1>
        <p className="lead text-muted">
          Manage your personal information and app settings securely.
        </p>
      </header>

      <form onSubmit={handleSave}>
        {/* Profile Information */}
        <section className="profile-card mb-4">
          <div className="section-header d-flex align-items-start justify-content-between flex-wrap">
            <div className="section-title">
              <i className="bi bi-person-badge me-2" />
              <strong>Profile Information</strong>
            </div>
            <div className="ms-3">
              <button
                type="button"
                className="btn-edit"
                onClick={() => setIsEditing((s) => !s)}
                aria-pressed={isEditing}
              >
                <i
                  className={`bi ${isEditing ? "bi-x-circle" : "bi-pencil"} me-1`}
                />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>

          <div className="row gy-4 mt-3">
            <div className="col-12 col-md-6">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className="form-control"
                value={profileData.fullName}
                onChange={handleProfileChange}
                disabled={fieldDisabled}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={profileData.email}
                disabled
                readOnly
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="mobileNumber" className="form-label">
                Mobile Number
              </label>
              <input
                id="mobileNumber"
                type="text"
                className="form-control"
                value={profileData.mobileNumber}
                onChange={handleProfileChange}
                disabled={fieldDisabled}
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="dob" className="form-label">
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                className="form-control"
                value={profileData.dob}
                onChange={handleProfileChange}
                disabled={fieldDisabled}
              />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="profile-card">
          <div className="section-header d-flex align-items-start justify-content-between flex-wrap">
            <div className="section-title">
              <i className="bi bi-sliders me-2" />
              <strong>Preferences</strong>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-12">
              <label className="form-label d-block mb-2">Notification Type</label>
              <div className="d-flex flex-column flex-sm-row gap-4 align-items-center">
                <div className="form-check">
                  <input
                    id="emailNotifications"
                    className="form-check-input"
                    type="checkbox"
                    checked={profileData.emailNotifications}
                    onChange={handleProfileChange}
                    disabled={fieldDisabled}
                  />
                  <label
                    className="form-check-label ms-2"
                    htmlFor="emailNotifications"
                  >
                    Email Notifications
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Save Button */}
        {isEditing && (
          <div className="text-end mt-4">
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-1" /> Save All Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
