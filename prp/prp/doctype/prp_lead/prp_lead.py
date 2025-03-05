# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import prp

class PRPLead(Document):
    def before_save(self):
        if self.has_value_changed("first_name") or self.has_value_changed("last_name"):
            self.lead_name = f"{self.first_name or ''} {self.last_name or ''}".strip()
    
    def on_update(self):
        prp.refetch_resource(self, "doc_update")

    def on_trash(self):
        prp.refetch_resource(self, "list_update")

    def after_insert(self):
        prp.refetch_resource(self, "list_update")
