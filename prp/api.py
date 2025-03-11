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


# In your custom Frappe app/API
@frappe.whitelist()
def get_documents_in_room(rel_doctype, rel_docname):
    """Get all documents associated with a specific doctype/docname"""
    if not rel_doctype or not rel_docname:
        frappe.throw(_("Doctype and docname are required"))

    try:
        # Use a direct SQL query to find documents with matching rooms
        documents = frappe.db.sql(
            """
            SELECT d.*
            FROM `tabPRP Document` d
            INNER JOIN `tabPRP Document Rooms` r ON d.name = r.parent
            WHERE r.rel_doctype = %s AND r.rel_docname = %s
              AND d.disabled = 0
        """,
            (rel_doctype, rel_docname),
            as_dict=True,
        )

        return {"success": True, "documents": documents}
    except Exception as e:
        frappe.log_error(f"Error finding documents in room: {str(e)}")
        return {"success": False, "message": str(e)}
