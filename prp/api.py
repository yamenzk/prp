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



@frappe.whitelist()
def get_child_tables(doctype, docname, child_doctypes=None):
    """
    Fetch child table data for a specific document

    Args:
        doctype: Parent doctype
        docname: Name of the document
        child_doctypes: Optional JSON string containing list of child doctypes to fetch

    Returns:
        Dictionary with child table data, keyed by fieldname
    """
    if not doctype or not docname:
        frappe.throw("Doctype and document name are required")

    # Validate if the user has permission to read this document
    if not frappe.has_permission(doctype, "read", docname):
        frappe.throw("You don't have permission to access this document")

    # Get the document
    doc = frappe.get_doc(doctype, docname)

    result = {}

    # Process only specific child tables if provided, otherwise fetch all
    if child_doctypes:
        try:
            child_doctypes = frappe.parse_json(child_doctypes)
        except:
            child_doctypes = []

    # Loop through all table fields in the document
    meta = frappe.get_meta(doctype)
    table_fields = [df for df in meta.fields if df.fieldtype == "Table"]

    for field in table_fields:
        # Skip if not in requested child doctypes
        if child_doctypes and field.options not in child_doctypes:
            continue

        # Get the child table data
        child_data = []
        if hasattr(doc, field.fieldname):
            for child_row in doc.get(field.fieldname):
                # Convert child row to dict and add to result
                row_data = child_row.as_dict()
                # Remove unnecessary fields
                for key in [
                    "docstatus",
                    "doctype",
                    "modified",
                    "modified_by",
                    "creation",
                    "owner",
                ]:
                    if key in row_data:
                        del row_data[key]
                child_data.append(row_data)

        # Add to result
        result[field.fieldname] = child_data

    return result


@frappe.whitelist()
def get_documents_with_children(
    doctype, fields=None, filters=None, order_by=None, limit=20, child_tables=None
):
    """
    Get documents with their child tables in a single call

    Args:
        doctype: Doctype to fetch
        fields: List of fields to fetch
        filters: Filters to apply
        order_by: Order clause
        limit: Maximum number of records
        child_tables: Optional list of child doctypes to fetch

    Returns:
        List of documents with child tables
    """
    # Parse parameters
    if fields and isinstance(fields, str):
        fields = frappe.parse_json(fields)

    if filters and isinstance(filters, str):
        filters = frappe.parse_json(filters)

    if child_tables and isinstance(child_tables, str):
        child_tables = frappe.parse_json(child_tables)

    # Fetch main documents
    docs = frappe.get_list(
        doctype,
        fields=fields or ["*"],
        filters=filters or {},
        order_by=order_by or "modified desc",
        limit_page_length=limit,
    )

    # If no child tables needed, return immediately
    if not child_tables:
        return docs

    # Fetch child tables for each document
    for doc in docs:
        doc_name = doc.get("name")
        if doc_name:
            child_data = get_child_tables(doctype, doc_name, child_tables)
            doc.update(child_data)

    return docs
