import frappe


__version__ = "0.0.1"
# Modify your function
def refetch_resource(doc, event=None):
    """
    Refresh cache for the given document type.
    This function will be called by Frappe's doc events.
    """
    # Get the cache key based on doctype
    cache_key = f"prp:{doc.doctype.lower().replace(' ', '_')}"

    frappe.publish_realtime(
        "prp:refetch_resource",
        {"cache_key": cache_key, "doc": doc.name, "doctype": doc.doctype, "event": event},
        after_commit=True,
    )
