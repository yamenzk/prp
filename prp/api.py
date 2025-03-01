import frappe

@frappe.whitelist()
def get_user_info():
    if not frappe.session.user or frappe.session.user == "Guest":
        frappe.throw("Authentication Error", exc=frappe.AuthenticationError)

    user = frappe.session.user
    user_doc = frappe.get_doc("User", user)

    return {
        "user": user,
        "email": user_doc.email,
        "full_name": user_doc.full_name,
        "user_image": user_doc.user_image,
        "roles": [role.role for role in user_doc.roles],
    }


@frappe.whitelist()
def fetch_doctype_fields(doctype_name):
    excluded_fieldtypes = ["Section Break", "Column Break", "Tab Break", "HTML"]

    fields = frappe.get_all(
        "DocField",
        filters={"parent": doctype_name, "fieldtype": ["not in", excluded_fieldtypes]},
        fields=["fieldname", "label", "fieldtype"],
        order_by="idx",
    )

    return fields
