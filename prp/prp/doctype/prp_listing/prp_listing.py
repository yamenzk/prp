# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class PRPListing(Document):
   
    def validate(self):
        if self.enable_secondhand_selling or self.enable_secondhand_renting:
            self.availability = "Available for Secondhand"
        else:
            if self.availability == "Available for Secondhand":
                frappe.throw("Availability cannot be set to 'Available for Secondhand' without enabling secondhand selling or renting")
                
    def on_update(self):
        if self.has_value_changed("availability") or self.has_value_changed("status"):
            update_hierarchies(self.building)


def get_field_stats(doctype, field, value, count_fields):
    """
    Generic function to get stats for any fields
    count_fields: list of tuples [(field_name, field_value, result_key)]
    """
    case_statements = ", ".join(
        [
            f"SUM(CASE WHEN {field_name} = '{field_value}' THEN 1 ELSE 0 END) as {result_key}"
            for field_name, field_value, result_key in count_fields
        ]
    )

    return frappe.db.sql(
        f"""
        SELECT 
            COUNT(*) as total,
            {case_statements}
        FROM `tab{doctype}`
        WHERE {field} = %s
    """,
        value,
        as_dict=1,
    )[0]


def determine_availability(stats):
    if stats.total == stats.sold_count:
        return "Available for Secondhand" if stats.secondhand_count > 0 else "Sold"
    return "Available"


def determine_handover_status(stats):
    if stats.total == stats.completed_count:
        return "Handover Completed"
    elif stats.due_count > 0:
        return "Due for Handover"
    return "Off-plan"


def update_doc_fields(doctype, name, updates):
    """
    Generic function to update multiple fields in a document
    updates: dict of field:value pairs to update
    """
    doc = frappe.get_doc(doctype, name)
    needs_update = False

    for field, value in updates.items():
        if doc.get(field) != value:
            doc.set(field, value)
            needs_update = True

    if needs_update:
        doc.save()

    return doc


@frappe.whitelist()
def update_hierarchies(building):
    # Get all stats in single queries
    building_stats = get_field_stats(
        "PRP Listing",
        "building",
        building,
        [
            ("availability", "Sold", "sold_count"),
            ("availability", "Available for Secondhand", "secondhand_count"),
            ("status", "Handover Completed", "completed_count"),
            ("status", "Due for Handover", "due_count"),
        ],
    )

    # Determine new states for building
    building_updates = {
        "availability": determine_availability(building_stats),
        "status": determine_handover_status(building_stats),
    }

    # Update building and get project reference
    building_doc = update_doc_fields("PRP Building", building, building_updates)

    # Get project stats
    project_stats = get_field_stats(
        "PRP Building",
        "project",
        building_doc.project,
        [
            ("availability", "Sold", "sold_count"),
            ("availability", "Available for Secondhand", "secondhand_count"),
            ("status", "Handover Completed", "completed_count"),
            ("status", "Due for Handover", "due_count"),
        ],
    )

    # Determine and update project states
    project_updates = {
        "availability": determine_availability(project_stats),
        "status": determine_handover_status(project_stats),
    }

    update_doc_fields("PRP Project", building_doc.project, project_updates)
