// // frappe.ui.form.on('Laborers attendance log', {
// //     before_save: function(frm) {
// //         open_camera_popup(frm);
// //     }
// // });

// // function open_camera_popup(frm) {
// //     let d = new frappe.ui.Dialog({
// //         title: 'Facial Recognition',
// //         fields: [
// //             {
// //                 fieldname: 'camera_feed',
// //                 fieldtype: 'HTML',
// //                 label: 'Camera Feed'
// //             }
// //         ],
// //         primary_action_label: 'Capture & Verify',
// //         primary_action: function() {
// //             capture_image_and_verify(frm, d);
// //         }
// //     });

// //     d.show();
// //     initialize_camera(d);
// // }

// // function initialize_camera(dialog) {
// //     let video = document.createElement('video');
// //     video.width = 400;
// //     video.height = 300;
// //     video.autoplay = true;

// //     navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
// //         video.srcObject = stream;
// //         dialog.fields_dict.camera_feed.$wrapper.empty().append(video);
// //         dialog.video_stream = stream;
// //     }).catch(error => {
// //         frappe.msgprint('Camera access denied or not available.');
// //         console.error('Error accessing camera:', error);
// //     });
// // }

// // function capture_image_and_verify(frm, dialog) {
// //     let canvas = document.createElement('canvas');
// //     let video = dialog.fields_dict.camera_feed.$wrapper.find('video')[0];

// //     canvas.width = video.videoWidth;
// //     canvas.height = video.videoHeight;
// //     let context = canvas.getContext('2d');
// //     context.drawImage(video, 0, 0, canvas.width, canvas.height);

// //     let image_data = canvas.toDataURL('image/jpeg');

// //     // Stop the video stream
// //     if (dialog.video_stream) {
// //         dialog.video_stream.getTracks().forEach(track => track.stop());
// //     }

// //     dialog.hide();

// //     frappe.call({
// //         method: "bio_facerecognition.bio_facerecognition.api.bio_facial_recognition.verify_face",
// //         args: {
// //             laborer: frm.doc.laborer,
// //             captured_image: image_data
// //         },
// //         callback: function(response) {
// //             if (response.message === "verified") {
// //                 frappe.msgprint("Face verified successfully.");
// //                 frm.save();  // Continue with the save process
// //             } else {
// //                 frappe.throw("Face does not match. Access denied.");
// //             }
// //         }
// //     });
// // }


// frappe.ui.form.on('Laborers Attendance Log', {
//     before_save: async function (frm) {
//         const laborerImageUrl = await getLaborerImage(frm.doc.laborer);
        
//         if (!laborerImageUrl) {
//             frappe.throw(__('No image found for the selected laborer.'));
//         }

//         const isMatch = await openWebcamAndVerifyFace(laborerImageUrl);

//         if (!isMatch) {
//             frappe.throw(__('Face verification failed. Attendance cannot be saved.'));
//         }
//     }
// });

// async function getLaborerImage(laborer) {
//     // Fetch the laborer's image from the "Files for Biometric" doctype
//     let response = await frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Files for Biometric",
//             filters: { laborer: laborer },
//             fields: ["image"],
//             limit_page_length: 1
//         }
//     });

//     if (response.message.length > 0) {
//         return response.message[0].image;  // Return the image URL
//     }
//     return null;
// }

// async function openWebcamAndVerifyFace(laborerImageUrl) {
//     return new Promise((resolve, reject) => {
//         const popup = new frappe.ui.Dialog({
//             title: __('Face Verification'),
//             fields: [
//                 { fieldtype: 'HTML', fieldname: 'webcam', options: '<video id="webcam" autoplay></video>' },
//                 { fieldtype: 'Button', fieldname: 'capture', label: __('Capture Image') }
//             ]
//         });

//         popup.show();

//         const video = document.getElementById('webcam');
//         navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
//             video.srcObject = stream;
//         });

//         popup.fields_dict.capture.$wrapper.on('click', async () => {
//             const capturedImage = captureImage(video);
//             const isMatch = await compareFaces(laborerImageUrl, capturedImage);
//             stream.getTracks().forEach(track => track.stop());  // Stop webcam
//             popup.hide();
//             resolve(isMatch);
//         });
//     });
// }

// function captureImage(video) {
//     const canvas = document.createElement('canvas');
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(video, 0, 0);
//     return canvas.toDataURL();  // Return image as base64
// }

// async function compareFaces(laborerImageUrl, capturedImage) {
//     await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
//     await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
//     await faceapi.nets.faceLandmark68Net.loadFromUri('/models');

//     const laborerImage = await faceapi.fetchImage(laborerImageUrl);
//     const capturedImg = await faceapi.fetchImage(capturedImage);

//     const laborerDescriptor = await faceapi.computeFaceDescriptor(laborerImage);
//     const capturedDescriptor = await faceapi.computeFaceDescriptor(capturedImg);

//     const distance = faceapi.euclideanDistance(laborerDescriptor, capturedDescriptor);
//     return distance < 0.6;  // Return true if distance is less than 0.6 (threshold for a match)
// }




frappe.ui.form.on('Laborers attendance log', {
    before_save: function(frm) {
        // Prevent default save
        frappe.validated = false;
        
        // Open camera popup for verification
        openCameraPopup(frm);
    }
});

function openCameraPopup(frm) {
    let stream = null;
    let isProcessing = false;
    
    const popup = new frappe.ui.Dialog({
        title: "Face Verification",
        fields: [
            {
                fieldname: "camera_container",
                fieldtype: "HTML",
                options: `
                    <div id="camera_wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px;">
                        <video id="camera" width="320" height="240" autoplay style="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></video>
                        <img id="captured_image" style="display:none; width:320px; height:240px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top:10px;"/>
                        <div id="verification_loader" style="display:none; text-align:center; margin-top:10px; width: 320px;">
                            <div class="progress">
                                <div class="progress-bar progress-bar-striped active" role="progressbar" 
                                     aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%">
                                    Verifying...
                                </div>
                            </div>
                        </div>
                    </div>`
            }
        ],
        primary_action_label: "Capture & Verify",
        primary_action: async function() {
            if (isProcessing) return;
            await captureAndVerifyImage(frm, popup, stream);
        },
        secondary_action_label: "Cancel",
        onhide: function() {
            cleanupCamera(stream);
        }
    });

    // Initialize camera
    initializeCamera().then(mediaStream => {
        stream = mediaStream;
    }).catch(error => {
        frappe.throw("Error accessing camera: " + error.message);
        popup.hide();
    });

    popup.show();
}

async function initializeCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: "user"
            } 
        });
        
        const video = document.querySelector("#camera");
        if (!video) throw new Error("Video element not found");
        
        video.srcObject = stream;
        return new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                video.play().then(() => resolve(stream)).catch(reject);
            };
            video.onerror = reject;
        });
    } catch (err) {
        console.error("Camera initialization error:", err);
        throw err;
    }
}

function cleanupCamera(stream) {
    if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());
    }
    const video = document.querySelector("#camera");
    if (video) {
        video.srcObject = null;
    }
}

async function captureAndVerifyImage(frm, popup, stream) {
    if (!stream) {
        frappe.throw("Camera stream not available");
        return;
    }

    try {
        const video = document.querySelector("#camera");
        const capturedImage = document.querySelector("#captured_image");
        const loaderElement = document.querySelector("#verification_loader");
        
        if (!video || !capturedImage || !loaderElement) {
            throw new Error("Required elements not found");
        }

        // Create canvas and capture image
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        
        // Convert to base64
        const imageData = canvas.toDataURL("image/png");
        
        // Update UI
        video.style.display = "none";
        capturedImage.src = imageData;
        capturedImage.style.display = "block";
        loaderElement.style.display = "block";
        popup.get_primary_btn().prop('disabled', true);

        // Verify face
        return new Promise((resolve, reject) => {
            frappe.call({
                method: "bio_facerecognition.bio_facerecognition.api.bio_facial_recognition.verify_face",
                args: {
                    laborer: frm.doc.attendance_laborer,
                    captured_image: imageData
                },
                callback: function(r) {
                    if (r.message) {
                        frappe.show_alert({
                            message: "Face verified successfully",
                            indicator: 'green'
                        });
                        
                        // Clean up camera stream before closing popup
                        cleanupCamera(stream);
                        
                        // Close the popup
                        popup.hide();
                        
                        // Enable form saving
                        frappe.validated = true;
                        
                        // Use timeout to ensure popup is closed before saving
                        setTimeout(() => {
                            // Save the form
                            frm.save().then(() => {
                                frappe.show_alert({
                                    message: "Record saved successfully",
                                    indicator: 'green'
                                });
                            }).catch((err) => {
                                frappe.show_alert({
                                    message: "Error saving record: " + (err.message || "Unknown error"),
                                    indicator: 'red'
                                });
                            });
                        }, 100);
                        
                        resolve();
                    } else {
                        handleVerificationFailure(popup, video, capturedImage, loaderElement, stream);
                        resolve();
                    }
                },
                error: function(err) {
                    handleVerificationFailure(popup, video, capturedImage, loaderElement, stream);
                    frappe.show_alert({
                        message: err.message || "Verification failed. Please try again.",
                        indicator: 'red'
                    });
                    reject(err);
                }
            });
        });
    } catch (error) {
        console.error("Capture error:", error);
        frappe.throw("Error capturing image: " + error.message);
    }
}

// Update the cleanup function to be more thorough
function cleanupCamera(stream) {
    try {
        // Stop all tracks in the stream
        if (stream && stream.getTracks) {
            stream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {
                    console.error("Error stopping track:", e);
                }
            });
        }
        
        // Clear video element
        const video = document.querySelector("#camera");
        if (video) {
            video.srcObject = null;
            video.load(); // Force reload to clear any cached frames
        }
        
        // Clear captured image
        const capturedImage = document.querySelector("#captured_image");
        if (capturedImage) {
            capturedImage.src = '';
        }
        
        // Hide loader if visible
        const loader = document.querySelector("#verification_loader");
        if (loader) {
            loader.style.display = "none";
        }
    } catch (error) {
        console.error("Error in cleanupCamera:", error);
    }
}

// // Update the form event to handle validation properly
// frappe.ui.form.on('Laborers attendance log', {
//     before_save: function(frm) {
//         if (!frappe.validated) {
//             // Prevent default save
//             frappe.validated = false;
            
//             // Open camera popup for verification
//             openCameraPopup(frm);
            
//             // Return false to prevent form submission
//             return false;
//         }
//         // If already validated, allow save to proceed
//         return true;
//     }
// });


