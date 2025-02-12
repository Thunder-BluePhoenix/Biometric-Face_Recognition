# import frappe
# import face_recognition
# import numpy as np
# from PIL import Image
# import base64
# from io import BytesIO

# @frappe.whitelist()
# def verify_face(laborer, captured_image):
#     """Verify the captured image with the laborer's stored biometric images."""
#     biometric_files = frappe.get_doc("Files for Biometric", {"laborer": laborer})
#     if not biometric_files:
#         return "no_biometric_files"

#     known_face_encodings = []
#     for field in ["biometric_image_1", "biometric_image_2", "biometric_image_3"]:
#         if biometric_files.get(field):
#             image_data = frappe.get_file(biometric_files.get(field)).get_content()
#             image = Image.open(BytesIO(image_data))
#             image_np = np.array(image)
#             face_encoding = face_recognition.face_encodings(image_np)
#             if face_encoding:
#                 known_face_encodings.append(face_encoding[0])

#     if not known_face_encodings:
#         return "no_face_encoding"

#     # Decode the captured image from base64
#     captured_image_data = base64.b64decode(captured_image.split(",")[1])
#     image = Image.open(BytesIO(captured_image_data))
#     image_np = np.array(image)
#     captured_face_encoding = face_recognition.face_encodings(image_np)

#     if not captured_face_encoding:
#         return "no_face_detected"

#     # Compare the captured face with stored encodings
#     matches = face_recognition.compare_faces(known_face_encodings, captured_face_encoding[0])
#     if any(matches):
#         return "verified"
#     else:
#         return "not_verified"

import frappe
import cv2
import face_recognition
import base64
import numpy as np

@frappe.whitelist()
def verify_face(laborer, captured_image):
    """Compare the captured image with the laborer's stored biometric images."""
    images = frappe.get_all(
        "Files for Biometric",
        filters={"laborer": laborer},
        fields=["biometric_image_1", "biometric_image_2", "biometric_image_3"]
    )

    if not images:
        frappe.throw("No biometric images found for this laborer.")

    captured_img = decode_base64_image(captured_image)

    for img_field in ["biometric_image_1", "biometric_image_2", "biometric_image_3"]:
        if images[0].get(img_field):
            stored_img = decode_base64_image(images[0][img_field])
            if face_match(captured_img, stored_img):
                return True  # Match found

    return False  # No match found

def decode_base64_image(image_base64):
    """Convert a Base64 image to an OpenCV image."""
    image_data = base64.b64decode(image_base64.split(',')[1])  # Remove 'data:image/png;base64,' prefix
    np_array = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(np_array, cv2.IMREAD_COLOR)

def face_match(img1, img2):
    """Use face_recognition to compare two images and check if they match."""
    img1_encoding = face_recognition.face_encodings(img1)
    img2_encoding = face_recognition.face_encodings(img2)

    if img1_encoding and img2_encoding:
        result = face_recognition.compare_faces([img1_encoding[0]], img2_encoding[0], tolerance=0.5)
        return result[0]

    return False


