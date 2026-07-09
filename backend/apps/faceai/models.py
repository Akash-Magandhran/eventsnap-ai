"""
FaceAI models.

FaceEmbedding: one row per detected face in an uploaded event Photo.
  A single photo can have multiple faces -> multiple FaceEmbedding rows.

Selfie: the reference embedding for a user, scoped to one event (a user
  could attend multiple events and re-capture a selfie at each).

FaceMatch: the result of comparing a Selfie's embedding against every
  FaceEmbedding in the event's photos. Only matches above the similarity
  threshold are stored - this table is literally the privacy boundary of
  the whole product: a user can only ever see photos that have a row here.
"""
import uuid
import numpy as np
from django.conf import settings
from django.db import models
from django.utils import timezone


class FaceEmbeddingField(models.BinaryField):
    """Stores a numpy float32 embedding vector as raw bytes."""
    pass


class FaceEmbedding(models.Model):
    id = models.BigAutoField(primary_key=True)
    photo = models.ForeignKey('photos.Photo', on_delete=models.CASCADE, related_name='face_embeddings')

    # Bounding box of the detected face within the photo (pixels)
    bbox_x = models.FloatField()
    bbox_y = models.FloatField()
    bbox_w = models.FloatField()
    bbox_h = models.FloatField()

    detection_score = models.FloatField()
    embedding = FaceEmbeddingField()  # 512-d float32 vector from InsightFace, stored as raw bytes
    embedding_dim = models.PositiveSmallIntegerField(default=512)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'face_embeddings'
        indexes = [models.Index(fields=['photo'])]

    def set_vector(self, vector: np.ndarray):
        self.embedding = vector.astype(np.float32).tobytes()
        self.embedding_dim = vector.shape[0]

    def get_vector(self) -> np.ndarray:
        return np.frombuffer(self.embedding, dtype=np.float32)


class Selfie(models.Model):
    id = models.BigAutoField(primary_key=True)
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='selfies')
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='selfies')

    image = models.ImageField(upload_to='selfies/%Y/%m/')
    embedding = FaceEmbeddingField()
    embedding_dim = models.PositiveSmallIntegerField(default=512)
    detection_score = models.FloatField(default=0.0)

    status = models.CharField(
        max_length=20,
        choices=(('processing', 'Processing'), ('matched', 'Matched'), ('failed', 'Failed')),
        default='processing',
    )
    error_message = models.TextField(blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'selfies'
        ordering = ['-created_at']

    def set_vector(self, vector: np.ndarray):
        self.embedding = vector.astype(np.float32).tobytes()
        self.embedding_dim = vector.shape[0]

    def get_vector(self) -> np.ndarray:
        return np.frombuffer(self.embedding, dtype=np.float32)


class FaceMatch(models.Model):
    id = models.BigAutoField(primary_key=True)
    selfie = models.ForeignKey(Selfie, on_delete=models.CASCADE, related_name='matches')
    photo = models.ForeignKey('photos.Photo', on_delete=models.CASCADE, related_name='matches')
    face_embedding = models.ForeignKey(FaceEmbedding, on_delete=models.CASCADE, related_name='matches')

    similarity = models.FloatField()  # cosine similarity, 0.0 - 1.0
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'face_matches'
        unique_together = ('selfie', 'photo', 'face_embedding')
        indexes = [models.Index(fields=['selfie', 'similarity'])]
        ordering = ['-similarity']
