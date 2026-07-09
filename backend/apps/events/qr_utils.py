"""
QR code generation for events.

Generates a styled QR code (rounded modules, brand color) pointing to the
event's join URL, and saves it to the Event.qr_code_image field.
"""
import io
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask
from django.core.files.base import ContentFile


BRAND_COLOR = (37, 99, 235)  # matches frontend primary blue


def generate_qr_for_event(event):
    """
    Generates a QR code image encoding event.join_url and attaches it to
    event.qr_code_image. Returns the event (unsaved - caller should save()).
    """
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(event.join_url)
    qr.make(fit=True)

    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
        color_mask=SolidFillColorMask(front_color=BRAND_COLOR, back_color=(255, 255, 255)),
    )

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)

    filename = f"event_{event.slug}.png"
    event.qr_code_image.save(filename, ContentFile(buffer.read()), save=False)
    return event
