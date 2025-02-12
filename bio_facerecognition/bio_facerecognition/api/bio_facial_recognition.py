import frappe
import face_recognition
import numpy as np
from PIL import Image
import base64
from io import BytesIO

@frappe.whitelist()
def verify_face(laborer, captured_image):
    """Verify the captured image with the laborer's stored biometric images."""
    biometric_files = frappe.get_doc("Files for Biometric", {"laborer": laborer})
    if not biometric_files:
        return "no_biometric_files"

    known_face_encodings = []
    for field in ["biometric_image_1", "biometric_image_2", "biometric_image_3"]:
        if biometric_files.get(field):
            image_data = frappe.get_file(biometric_files.get(field)).get_content()
            image = Image.open(BytesIO(image_data))
            image_np = np.array(image)
            face_encoding = face_recognition.face_encodings(image_np)
            if face_encoding:
                known_face_encodings.append(face_encoding[0])

    if not known_face_encodings:
        return "no_face_encoding"

    # Decode the captured image from base64
    captured_image_data = base64.b64decode(captured_image.split(",")[1])
    image = Image.open(BytesIO(captured_image_data))
    image_np = np.array(image)
    captured_face_encoding = face_recognition.face_encodings(image_np)

    if not captured_face_encoding:
        return "no_face_detected"

    # Compare the captured face with stored encodings
    matches = face_recognition.compare_faces(known_face_encodings, captured_face_encoding[0])
    if any(matches):
        return "verified"
    else:
        return "not_verified"

