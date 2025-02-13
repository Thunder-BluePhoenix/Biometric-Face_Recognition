import frappe
def check_verifed(doc,method=None):
    if doc.custom_is_verify == 0:
        frappe.throw("Face not verified")
    else:
        frappe.msgprint("Face verified")
