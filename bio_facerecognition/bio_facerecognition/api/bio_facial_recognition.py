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
    try:
        images = frappe.get_all(
            "Files for Biometric",
            filters={"laborer": laborer},
            fields=["biometric_image_1", "biometric_image_2", "biometric_image_3"]
        )

        if not images:
            frappe.throw("No biometric images found for this laborer.")

        # Decode captured image
        captured_img = decode_base64_image(captured_image)

        for img_field in ["biometric_image_1", "biometric_image_2", "biometric_image_3"]:
            if images[0].get(img_field):
                try:
                    # Get the actual file content instead of just the path
                    file_path = images[0][img_field]
                    file_doc = frappe.get_doc("File", {"file_url": file_path})
                    if not file_doc:
                        continue
                        
                    # Get the base64 content of the stored image
                    stored_img_base64 = file_doc.get_content()
                    if not stored_img_base64:
                        continue
                        
                    stored_img = decode_base64_image(stored_img_base64)
                    if face_match(captured_img, stored_img):
                        frappe.logger().debug("Face match found!")
                        return True
                except Exception as e:
                    frappe.log_error(f"Error processing {img_field}: {str(e)}")
                    continue

        frappe.logger().debug("No face match found in any stored images")
        return False
        
    except Exception as e:
        frappe.log_error(f"Face verification error: {str(e)}")
        frappe.throw("Error during face verification. Please try again.")

def decode_base64_image(image_base64):
    """Convert a Base64 image to an OpenCV image."""
    try:
        # Handle both cases: with and without data URI prefix
        if isinstance(image_base64, str):
            if ',' in image_base64:
                image_data = base64.b64decode(image_base64.split(',')[1])
            else:
                # Check if it's already base64 encoded
                try:
                    image_data = base64.b64decode(image_base64)
                except:
                    # If not base64, try to read as file content
                    image_data = image_base64.encode('utf-8')
        else:
            # If bytes, use directly
            image_data = image_base64
            
        np_array = np.frombuffer(image_data, np.uint8)
        return cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    except Exception as e:
        frappe.log_error(f"Base64 decode error: {str(e)}")
        raise



def face_match(img1, img2):
    """Use face_recognition to compare two images and check if they match."""
    try:
        # Convert images to RGB if they're in BGR format (OpenCV default)
        img1_rgb = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)
        img2_rgb = cv2.cvtColor(img2, cv2.COLOR_BGR2RGB)
        
        # Get face locations first
        img1_face_locations = face_recognition.face_locations(img1_rgb)
        img2_face_locations = face_recognition.face_locations(img2_rgb)
        
        if not img1_face_locations or not img2_face_locations:
            frappe.logger().debug("No faces found in one or both images")
            return False
        
        # Get face encodings with more robust parameters
        img1_encoding = face_recognition.face_encodings(
            img1_rgb, 
            img1_face_locations, 
            num_jitters=100,  # More jitters for better accuracy
            model="large"     # Using the more accurate CNN model
        )
        
        img2_encoding = face_recognition.face_encodings(
            img2_rgb, 
            img2_face_locations,
            num_jitters=100,
            model="large"
        )

        if img1_encoding and img2_encoding:
            # Get the face distance
            distance = face_recognition.face_distance([img1_encoding[0]], img2_encoding[0])
            frappe.logger().debug(f"Face match distance: {distance}")
            
            # Compare faces with slightly higher tolerance
            result = face_recognition.compare_faces(
                [img1_encoding[0]], 
                img2_encoding[0], 
                tolerance=0.6  # Slightly increased tolerance
            )
            
            return result[0]
        
        return False
        
    except Exception as e:
        frappe.log_error(f"Face matching error: {str(e)}")
        return False



@frappe.whitelist()
def verify_face_and_save(laborer, captured_image, doc_data):
    """Verify face and save document if verification is successful."""
    try:
        # First verify the face
        is_verified = verify_face(laborer, captured_image)
        
        if is_verified:
            # Get the document to save
            doc = frappe.get_doc("Laborers attendance log", doc_data)
            
            # Save the document
            doc.save(ignore_permissions=True)
            
            frappe.db.commit()
            
            return {
                "success": True,
                "message": "Face verified and attendance logged successfully"
            }
        else:
            return {
                "success": False,
                "message": "Face verification failed"
            }
            
    except Exception as e:
        frappe.log_error(f"Face verification and save error: {str(e)}")
        return {
            "success": False,
            "message": f"Error during process: {str(e)}"
        }

