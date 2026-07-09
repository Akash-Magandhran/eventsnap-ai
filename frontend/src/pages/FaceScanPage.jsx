import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, RotateCcw, Sparkles, Upload } from 'lucide-react';
import Alert from '../components/Alert';
import { faceaiApi } from '../api/faceai';
import './FaceScanPage.css';

const STAGES = {
  CAMERA: 'camera',
  PREVIEW: 'preview',
  PROCESSING: 'processing',
  DONE: 'done',
};

export default function FaceScanPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [stage, setStage] = useState(STAGES.CAMERA);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError(true);
    }
  }, []);

  useEffect(() => {
    if (stage === STAGES.CAMERA) startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [stage, startCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // mirror to match what the user sees
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      setCapturedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setStage(STAGES.PREVIEW);
    }, 'image/jpeg', 0.92);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedBlob(file);
    setPreviewUrl(URL.createObjectURL(file));
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStage(STAGES.PREVIEW);
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    setPreviewUrl(null);
    setError('');
    setStage(STAGES.CAMERA);
  };

  const handleSubmit = async () => {
    if (!capturedBlob) return;
    setStage(STAGES.PROCESSING);
    setError('');
    try {
      const { data } = await faceaiApi.captureSelfie(eventId, capturedBlob);
      setMatchCount(data.data.match_count);
      setStage(STAGES.DONE);
      setTimeout(() => navigate(`/my-photos/${eventId}`), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not process your selfie. Please try again with a clearer photo.');
      setStage(STAGES.PREVIEW);
    }
  };

  return (
    <div className="scan-page">
      <div className="scan-card">
        <div className="eyebrow" style={{ marginBottom: 8 }}>Step 3 of 5</div>
        <h1 style={{ color: '#FAF8F4', fontSize: '1.8rem' }}>
          {stage === STAGES.PROCESSING ? 'Searching for your photos...' :
           stage === STAGES.DONE ? 'All set!' : 'Capture your selfie'}
        </h1>
        <p style={{ color: 'rgba(250,248,244,0.6)', marginTop: 8 }}>
          {stage === STAGES.CAMERA && 'Center your face in the frame and look directly at the camera.'}
          {stage === STAGES.PREVIEW && 'Looks good? Submit to find your photos.'}
          {stage === STAGES.PROCESSING && 'Our AI is comparing your face against every event photo.'}
          {stage === STAGES.DONE && `Found ${matchCount} photo${matchCount === 1 ? '' : 's'} of you. Redirecting...`}
        </p>

        <Alert type="error" onClose={() => setError('')}>{error}</Alert>

        <div className={`scan-camera-frame ${stage === STAGES.PROCESSING ? 'scanning' : ''}`}>
          {stage === STAGES.CAMERA && !cameraError && (
            <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
          )}
          {stage === STAGES.CAMERA && cameraError && (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.85rem', padding: 20, textAlign: 'center' }}>
              Camera unavailable. Upload a photo instead.
            </div>
          )}
          {(stage === STAGES.PREVIEW || stage === STAGES.PROCESSING || stage === STAGES.DONE) && previewUrl && (
            <img src={previewUrl} alt="Your selfie" />
          )}
          {stage === STAGES.PROCESSING && <div className="scan-ring-line" />}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {stage === STAGES.CAMERA && (
          <div className="scan-controls">
            {!cameraError ? (
              <button className="btn btn-primary btn-lg" onClick={handleCapture}>
                <Camera size={18} /> Capture
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} /> Upload Photo
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handleFileUpload} style={{ display: 'none' }} />
          </div>
        )}

        {stage === STAGES.PREVIEW && (
          <div className="scan-controls">
            <button className="btn btn-secondary btn-lg" onClick={handleRetake}>
              <RotateCcw size={18} /> Retake
            </button>
            <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
              <Sparkles size={18} /> Find My Photos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
