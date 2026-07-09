"""
FaceAI service layer.

Orchestrates the two core workflows of the product:

1. process_photo(photo)  - admin uploads an event photo
     -> detect every face -> generate embedding for each -> store FaceEmbedding rows

2. process_selfie(selfie) - attendee captures their selfie
     -> detect the (single) face -> generate embedding -> store on Selfie
     -> compare against every FaceEmbedding belonging to photos in this event
     -> store a FaceMatch row for every comparison above the threshold

Both are written to run synchronously and be safe to call from a request
handler for local development. In a production deployment these would be
handed off to a task queue (Celery/RQ) - see docs/deployment.md for notes
on that upgrade path.
"""
import logging
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .engine import detect_faces, read_image_bgr, cosine_similarity
from .models import FaceEmbedding, FaceMatch

logger = logging.getLogger(__name__)


def process_photo(photo):
    """
    Detects all faces in an uploaded event Photo and stores one
    FaceEmbedding row per face. Updates photo.status and the parent
    event's processed_photos counter.
    """
    photo.status = 'processing'
    photo.save(update_fields=['status'])

    try:
        image_bgr = read_image_bgr(photo.image.path)
        height, width = image_bgr.shape[:2]

        detections = detect_faces(image_bgr)

        with transaction.atomic():
            for det in detections:
                fe = FaceEmbedding(
                    photo=photo,
                    bbox_x=det.bbox[0], bbox_y=det.bbox[1],
                    bbox_w=det.bbox[2], bbox_h=det.bbox[3],
                    detection_score=det.detection_score,
                )
                fe.set_vector(det.embedding)
                fe.save()

            photo.faces_detected = len(detections)
            photo.width = width
            photo.height = height
            photo.status = 'processed'
            photo.processed_at = timezone.now()
            photo.save(update_fields=['faces_detected', 'width', 'height', 'status', 'processed_at'])

        event = photo.event
        event.processed_photos = event.photos.filter(status='processed').count()
        event.save(update_fields=['processed_photos'])

        logger.info("Processed photo %s: %d face(s) detected", photo.id, len(detections))

        # If any attendees already have a selfie for this event, retroactively
        # match them against this newly-processed photo's faces.
        _match_new_photo_against_existing_selfies(photo)

    except Exception as exc:
        photo.status = 'failed'
        photo.error_message = str(exc)[:500]
        photo.save(update_fields=['status', 'error_message'])
        raise


def process_selfie(selfie):
    """
    Detects the face in a user's selfie, stores its embedding, then compares
    it against every face embedding from photos belonging to selfie.event.
    Creates FaceMatch rows for comparisons above FACE_AI_CONFIG['MATCH_THRESHOLD'].
    """
    cfg = settings.FACE_AI_CONFIG

    try:
        image_bgr = read_image_bgr(selfie.image.path)
        detections = detect_faces(image_bgr)

        if not detections:
            selfie.status = 'failed'
            selfie.error_message = "No face detected in selfie. Please retake with better lighting, facing the camera directly."
            selfie.save(update_fields=['status', 'error_message'])
            return selfie

        # If multiple faces appear in a "selfie" (e.g. someone else in frame),
        # use the largest face by bounding-box area - that's almost always the subject.
        best = max(detections, key=lambda d: d.bbox[2] * d.bbox[3])

        selfie.set_vector(best.embedding)
        selfie.detection_score = best.detection_score
        selfie.status = 'matched'
        selfie.save(update_fields=['embedding', 'embedding_dim', 'detection_score', 'status'])

        _run_matching_for_selfie(selfie)

        # Mark attendance as having captured a selfie
        from apps.events.models import EventAttendance
        EventAttendance.objects.filter(event=selfie.event, user=selfie.user).update(has_selfie=True)

        return selfie

    except Exception as exc:
        selfie.status = 'failed'
        selfie.error_message = str(exc)[:500]
        selfie.save(update_fields=['status', 'error_message'])
        raise


def _run_matching_for_selfie(selfie):
    """Compares a selfie's stored embedding against every face in its event's photos."""
    cfg = settings.FACE_AI_CONFIG
    threshold = cfg['MATCH_THRESHOLD']
    selfie_vec = selfie.get_vector()

    candidate_embeddings = FaceEmbedding.objects.filter(photo__event=selfie.event).select_related('photo')

    matches_to_create = []
    for fe in candidate_embeddings:
        similarity = cosine_similarity(selfie_vec, fe.get_vector())
        if similarity >= threshold:
            matches_to_create.append(
                FaceMatch(selfie=selfie, photo=fe.photo, face_embedding=fe, similarity=similarity)
            )

    if matches_to_create:
        # ignore_conflicts guards against re-running matching for a selfie that's already been matched
        FaceMatch.objects.bulk_create(matches_to_create, ignore_conflicts=True)

    logger.info(
        "Selfie %s matched against %d candidate faces -> %d matches (threshold=%.2f)",
        selfie.id, candidate_embeddings.count(), len(matches_to_create), threshold,
    )


def _match_new_photo_against_existing_selfies(photo):
    """
    When a new photo is uploaded AFTER some attendees already captured
    selfies for the event, retroactively check this photo's faces against
    those existing selfies so nobody has to re-take their selfie.
    """
    from .models import Selfie

    cfg = settings.FACE_AI_CONFIG
    threshold = cfg['MATCH_THRESHOLD']

    existing_selfies = Selfie.objects.filter(event=photo.event, status='matched')
    if not existing_selfies.exists():
        return

    new_embeddings = list(photo.face_embeddings.all())
    if not new_embeddings:
        return

    matches_to_create = []
    for selfie in existing_selfies:
        selfie_vec = selfie.get_vector()
        for fe in new_embeddings:
            similarity = cosine_similarity(selfie_vec, fe.get_vector())
            if similarity >= threshold:
                matches_to_create.append(
                    FaceMatch(selfie=selfie, photo=photo, face_embedding=fe, similarity=similarity)
                )

    if matches_to_create:
        FaceMatch.objects.bulk_create(matches_to_create, ignore_conflicts=True)
