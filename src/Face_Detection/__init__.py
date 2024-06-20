from flask import Blueprint

face_detection_bp = Blueprint(
    'face_detection_bp', __name__,
    template_folder='templates',
    static_folder='static'
)

from . import routes