frappe.ui.form.on('Files for Biometric', {
    laborer: function(frm) {
        if (frm.doc.laborer) {
            frappe.db.get_value('Laborers Master', frm.doc.laborer, 'full_name', function(r) {
                if (r && r.full_name) {
                    frm.set_value('laborer_name', r.full_name);
                }
            });
        }
    }
});
