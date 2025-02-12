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
    let stream;  // Store stream reference for cleanup
    let popup = new frappe.ui.Dialog({
        title: "Face Verification",
        fields: [
            {
                fieldname: "camera_container",
                fieldtype: "HTML",
                options: `
                    <div id="camera_wrapper">
                        <video id="camera" width="320" height="240" autoplay></video>
                        <img id="captured_image" style="display:none; max-width:320px; max-height:240px; border:1px solid #ddd; margin-top:10px;"/>
                        <div id="verification_loader" style="display:none; text-align:center; margin-top:10px;">
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
        primary_action: function() {
            captureAndVerifyImage(frm, popup, stream);
        },
        onhide: function() {
            // Stop the camera stream when dialog is closed
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    });

    popup.show();
    startCamera().then(videoStream => {
        stream = videoStream;
    }).catch(error => {
        frappe.throw("Error accessing camera: " + error.message);
    });
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.querySelector("#camera");
        if (video) {
            video.srcObject = stream;
            await video.play();
        }
        return stream;
    } catch (err) {
        console.error("Error accessing the camera: ", err);
        throw err;
    }
}

function captureAndVerifyImage(frm, popup, stream) {
    try {
        let video = document.querySelector("#camera");
        if (!video) {
            frappe.throw("Camera not found.");
            return;
        }

        let canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        let context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop the video stream and hide the video element
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        video.style.display = "none";

        // Show captured image and loader
        let capturedImage = canvas.toDataURL("image/png");
        let imgElement = document.querySelector("#captured_image");
        let loaderElement = document.querySelector("#verification_loader");
        imgElement.src = capturedImage;
        imgElement.style.display = "block";
        loaderElement.style.display = "block";

        // Disable the capture button during verification
        popup.get_primary_btn().prop('disabled', true);

        // Send image to server for verification
        frappe.call({
            method: "bio_facerecognition.bio_facerecognition.api.bio_facial_recognition.verify_face",
            args: {
                laborer: frm.doc.attendance_laborer,
                captured_image: capturedImage
            },
            callback: function(r) {
                if (r.message) {
                    frappe.show_alert({
                        message: "Face verified successfully.",
                        indicator: 'green'
                    });
                    popup.hide();
                    
                    // Re-enable form saving and trigger save
                    frappe.validated = true;
                    frm.save();
                } else {
                    frappe.show_alert({
                        message: "Face verification failed. Please try again.",
                        indicator: 'red'
                    });
                    // Hide loader and enable capture button for retry
                    loaderElement.style.display = "none";
                    popup.get_primary_btn().prop('disabled', false);
                    video.style.display = "block";
                    imgElement.style.display = "none";
                    
                    // Restart camera for retry
                    startCamera().then(videoStream => {
                        stream = videoStream;
                    }).catch(error => {
                        frappe.throw("Error accessing camera: " + error.message);
                    });
                }
            },
            error: function(r) {
                frappe.show_alert({
                    message: "Error during verification. Please try again.",
                    indicator: 'red'
                });
                // Hide loader and enable capture button for retry
                loaderElement.style.display = "none";
                popup.get_primary_btn().prop('disabled', false);
                video.style.display = "block";
                imgElement.style.display = "none";
                
                // Restart camera for retry
                startCamera().then(videoStream => {
                    stream = videoStream;
                }).catch(error => {
                    frappe.throw("Error accessing camera: " + error.message);
                });
            }
        });
    } catch (error) {
        console.error("Error during capture:", error);
        frappe.throw("Error capturing image. Please try again.");
    }
}

