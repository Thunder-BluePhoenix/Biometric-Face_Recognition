frappe.ui.form.on('Laborers Attendance Log', {
    before_save: function(frm) {
        open_camera_popup(frm);
    }
});

function open_camera_popup(frm) {
    let d = new frappe.ui.Dialog({
        title: 'Facial Recognition',
        fields: [
            {
                fieldname: 'camera_feed',
                fieldtype: 'HTML',
                label: 'Camera Feed'
            }
        ],
        primary_action_label: 'Capture & Verify',
        primary_action: function() {
            capture_image_and_verify(frm, d);
        }
    });

    d.show();
    initialize_camera(d);
}

function initialize_camera(dialog) {
    let video = document.createElement('video');
    video.width = 400;
    video.height = 300;
    video.autoplay = true;

    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        video.srcObject = stream;
        dialog.fields_dict.camera_feed.$wrapper.empty().append(video);
        dialog.video_stream = stream;
    }).catch(error => {
        frappe.msgprint('Camera access denied or not available.');
        console.error('Error accessing camera:', error);
    });
}

function capture_image_and_verify(frm, dialog) {
    let canvas = document.createElement('canvas');
    let video = dialog.fields_dict.camera_feed.$wrapper.find('video')[0];

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    let image_data = canvas.toDataURL('image/jpeg');

    // Stop the video stream
    if (dialog.video_stream) {
        dialog.video_stream.getTracks().forEach(track => track.stop());
    }

    dialog.hide();

    frappe.call({
        method: "bio_facerecognition.bio_facerecognition.api.bio_facial_recognition.verify_face",
        args: {
            laborer: frm.doc.laborer,
            captured_image: image_data
        },
        callback: function(response) {
            if (response.message === "verified") {
                frappe.msgprint("Face verified successfully.");
                frm.save();  // Continue with the save process
            } else {
                frappe.throw("Face does not match. Access denied.");
            }
        }
    });
}


