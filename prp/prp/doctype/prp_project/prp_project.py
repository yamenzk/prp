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
                    project_doc = frappe.get_doc("PRP Project", parent_project_name)
                    self.town = project_doc.town
                    self.suburb = project_doc.suburb
                    self.city = project_doc.city
            if territory_doc.parent_territory and not territory_doc.is_phase:
                town_doc = frappe.get_doc("PRP Territory", territory_doc.parent_territory)
                self.town = town_doc.name_en
                if town_doc.parent_territory:
                    suburb_doc = frappe.get_doc("PRP Territory", town_doc.parent_territory)
                    self.suburb = suburb_doc.name_en
                    if suburb_doc.parent_territory:
                        city_doc = frappe.get_doc("PRP Territory", suburb_doc.parent_territory)
                        self.city = city_doc.name_en
                    