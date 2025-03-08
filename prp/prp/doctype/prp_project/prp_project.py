# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class PRPProject(Document):

    def validate(self):
        if self.territory:
            territory_doc = frappe.get_doc("PRP Territory", self.territory)
            if territory_doc.is_phase:
                self.is_phase = 1
                if territory_doc.parent_territory:
                    parent_project_name = frappe.get_value(
                        "PRP Project", {"territory": territory_doc.parent_territory}, "name"
                    )
                    self.parent_project = parent_project_name
