"""
InsightFace engine wrapper.

This module owns the actual AI model. It is loaded ONCE per process (the
InsightFace model files - detection + recognition ONNX models - are large
and slow to initialize, so we use a singleton pattern via lru_cache).

InsightFace's `buffalo_l` model pack bundles:
  - a face DETECTION model (finds bounding boxes + 5-point landmarks)
  - a face RECOGNITION model (turns an aligned face crop into a 512-d
    embedding vector)

On first run, insightface will download the buffalo_l weights (~280MB) to
INSIGHTFACE_HOME (configured in settings.py, defaults to backend/.insightface).
This requires an internet connection the first time only.
"""
import logging
from functools import lru_cache

import cv2
import numpy as np
from django.conf import settings

logger = logging.getLogger(__name__)


class FaceDetectionResult:
    """Plain container for one detected face."""

    __slots__ = ('bbox', 'detection_score', 'embedding')

    def __init__(self, bbox, detection_score, embedding):
        self.bbox = bbox  # (x, y, w, h) in pixels
        self.detection_score = detection_score
        self.embedding = embedding  # np.ndarray, float32, shape (512,)


@lru_cache(maxsize=1)
def get_face_app():
    """
    Lazily loads and caches the InsightFace FaceAnalysis app for this process.
    Importing insightface at module load time (rather than at the top of this
    file) keeps Django management commands that don't need AI (like
    `migrate` or `createsuperuser`) fast and avoids a hard crash if the
    model weights haven't been downloaded yet for commands that don't need them.
    """
    from insightface.app import FaceAnalysis

    cfg = settings.FACE_AI_CONFIG
    logger.info("Loading InsightFace model '%s' (this happens once per process)...", cfg['MODEL_NAME'])

    app = FaceAnalysis(
        name=cfg['MODEL_NAME'],
        root=settings.INSIGHTFACE_HOME,
        providers=['CPUExecutionProvider'] if cfg['CTX_ID'] < 0 else ['CUDAExecutionProvider', 'CPUExecutionProvider'],
    )
    app.prepare(ctx_id=cfg['CTX_ID'], det_size=cfg['DET_SIZE'])

    logger.info("InsightFace model loaded successfully.")
    return app


def read_image_bgr(file_path: str) -> np.ndarray:
    """Reads an image from disk into an OpenCV BGR numpy array."""
    img = cv2.imread(file_path)
    if img is None:
        # cv2.imread silently returns None on unreadable files (corrupt, unsupported format, bad path)
        raise ValueError(f"Could not read image at {file_path}. File may be corrupt or in an unsupported format.")
    return img


def detect_faces(image_bgr: np.ndarray, min_det_score: float = None):
    """
    Runs detection + embedding extraction on a single image.
    Returns a list of FaceDetectionResult, one per face found, filtered by
    the minimum detection confidence threshold.
    """
    cfg = settings.FACE_AI_CONFIG
    threshold = min_det_score if min_det_score is not None else cfg['MIN_DET_SCORE']

    app = get_face_app()
    faces = app.get(image_bgr)

    results = []
    for face in faces:
        if face.det_score < threshold:
            continue
        x1, y1, x2, y2 = face.bbox.astype(float)
        bbox = (x1, y1, max(x2 - x1, 1.0), max(y2 - y1, 1.0))
        embedding = face.normed_embedding.astype(np.float32)  # already L2-normalized by insightface
        results.append(FaceDetectionResult(bbox=bbox, detection_score=float(face.det_score), embedding=embedding))

    return results


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Cosine similarity between two embedding vectors.
    InsightFace's normed_embedding outputs are already unit-length, so this
    reduces to a dot product, but we normalize defensively in case a vector
    came from elsewhere with different normalization.
    """
    a = vec_a.astype(np.float64)
    b = vec_b.astype(np.float64)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)
