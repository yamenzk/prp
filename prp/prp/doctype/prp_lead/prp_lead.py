# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class PRPLead(Document):
    def on_update(self):
        if self.has_value_changed("first_name") or self.has_value_changed("last_name"):
            self.lead_name = f"{self.first_name or ''} {self.last_name or ''}".strip()
