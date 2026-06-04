/**
 * components/employee/SubmitForm.jsx
 * Step 2 — location, details, image upload, and submit.
 */
import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { OFFICE_LOCATIONS } from '../../lib/constants';
import Spinner from '../shared/Spinner';

export default function SubmitForm({ issue, subCategory, onBack, onSubmit, submitting }) {
  const [locationZone, setLocationZone] = useState('');
  const [deskNumber,   setDeskNumber]   = useState('');
  const [desktopId,    setDesktopId]    = useState('');
  const [details,      setDetails]      = useState('');
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const clearImage = () => { setImageFile(null); setImagePreview(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!locationZone) return;

    const fd = new FormData();
    fd.append('category',     issue.title);
    fd.append('subCategory',  subCategory);
    fd.append('locationZone', locationZone);
    fd.append('deskNumber',   deskNumber);
    fd.append('desktopId',    desktopId);
    fd.append('details',      details);
    fd.append('priority',     issue.priority);
    if (imageFile) fd.append('image', imageFile);

    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="submit-form">
      {/* Back breadcrumb */}
      <div className="form-breadcrumb">
        <button type="button" onClick={onBack} className="btn-back">← Back</button>
        <div>
          <p className="breadcrumb-title">{issue.title}</p>
          <p className="breadcrumb-sub">{subCategory}</p>
        </div>
      </div>

      {/* Location section */}
      <fieldset className="form-fieldset">
        <legend className="fieldset-legend">📍 Your Location <span className="required">*</span></legend>
        <div className="location-grid">
          <div className="form-group">
            <label className="form-label">Office Zone</label>
            <select
              required
              value={locationZone}
              onChange={e => { setLocationZone(e.target.value); setDeskNumber(''); }}
              className="form-select"
            >
              <option value="">Select area…</option>
              {Object.keys(OFFICE_LOCATIONS).map(z => <option key={z}>{z}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Desk / Station</label>
            <select
              required
              value={deskNumber}
              onChange={e => setDeskNumber(e.target.value)}
              disabled={!locationZone}
              className="form-select"
            >
              <option value="">Select desk…</option>
              {(OFFICE_LOCATIONS[locationZone] || []).map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">PC / Asset Tag</label>
            <input
              type="text"
              value={desktopId}
              onChange={e => setDesktopId(e.target.value)}
              placeholder="e.g. PC-1042"
              className="form-input"
            />
          </div>
        </div>
      </fieldset>

      {/* Details */}
      <div className="form-group">
        <label className="form-label">Additional Details <span className="optional">(optional)</span></label>
        <textarea
          rows={3}
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder="Describe the issue, any error messages, or what you were doing when it happened…"
          className="form-textarea"
        />
      </div>

      {/* Image upload */}
      <div className="form-group">
        <label className="form-label">Screenshot / Photo <span className="optional">(optional)</span></label>
        <label className="upload-zone">
          <Upload size={18} />
          <span>{imageFile ? imageFile.name : 'Click to attach an image (max 10 MB)'}</span>
          <input type="file" accept="image/*" onChange={handleImage} className="sr-only" />
        </label>
        {imagePreview && (
          <div className="image-preview-wrapper">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button type="button" onClick={clearImage} className="image-clear">
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="submit" disabled={submitting || !locationZone} className="btn-primary">
          {submitting ? <><Spinner size={16} /> Submitting…</> : '🎫 Submit Ticket'}
        </button>
      </div>
    </form>
  );
}
