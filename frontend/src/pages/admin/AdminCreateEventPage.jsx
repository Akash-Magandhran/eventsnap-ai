import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import Alert from '../../components/Alert';
import { eventsApi } from '../../api/events';
import './AdminLayout.css';

export default function AdminCreateEventPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [coverPreview, setCoverPreview] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (formData) => {
    setServerError('');
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (formData.cover_image?.[0]) payload.cover_image = formData.cover_image[0];
      else delete payload.cover_image;

      const { data } = await eventsApi.create(payload);
      navigate(`/admin/events/${data.data.id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-topbar">
        <h1>Create Event</h1>
      </div>

      <div className="card" style={{ maxWidth: 560, padding: 32 }}>
        <Alert type="error" onClose={() => setServerError('')}>{serverError}</Alert>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="auth-form-group">
            <label htmlFor="name">Event Name</label>
            <input
              id="name"
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Priya & Arjun's Wedding"
              {...register('name', { required: 'Event name is required', minLength: { value: 3, message: 'Too short' } })}
            />
            {errors.name && <span className="field-error-text">{errors.name.message}</span>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="input-field"
              rows={3}
              placeholder="A short description guests will see when they scan the QR code"
              {...register('description')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="auth-form-group">
              <label htmlFor="event_date">Event Date</label>
              <input id="event_date" type="date" className="input-field" {...register('event_date')} />
            </div>
            <div className="auth-form-group">
              <label htmlFor="location">Location</label>
              <input id="location" className="input-field" placeholder="Venue or city" {...register('location')} />
            </div>
          </div>

          <div className="auth-form-group">
            <label htmlFor="cover_image">Cover Image (optional)</label>
            <label
              htmlFor="cover_image"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                border: '1.5px dashed var(--border-color)', borderRadius: 12, padding: 24, cursor: 'pointer',
                backgroundImage: coverPreview ? `url(${coverPreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center',
                minHeight: 100, color: coverPreview ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {!coverPreview && <><ImagePlus size={20} /> Click to upload</>}
            </label>
            <input id="cover_image" type="file" accept="image/*" style={{ display: 'none' }} {...register('cover_image')} onChange={onCoverChange} />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting} style={{ marginTop: 8 }}>
            {submitting ? 'Creating...' : 'Create Event & Generate QR'}
          </button>
        </form>
      </div>
    </div>
  );
}
