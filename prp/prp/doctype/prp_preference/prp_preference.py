# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt
import prp

class PRPPreference(Document):
    def before_save(self):
        if self.has_value_changed("min_sqm"):
            min_sqm = self.min_sqm or 0
            self.min_sqft = flt(min_sqm) * 10.7639
        if self.has_value_changed("max_sqm"):
            max_sqm = self.max_sqm or 0
            self.max_sqft = flt(max_sqm) * 10.7639
        if self.has_value_changed("min_sqft"):
            min_sqft = self.min_sqft or 0
            self.min_sqm = flt(min_sqft) / 10.7639
        if self.has_value_changed("max_sqft"):
            max_sqft = self.max_sqft or 0
            self.max_sqm = flt(max_sqft) / 10.7639
        if self.has_value_changed("sqm"):
            sqm = self.sqm or 0
            self.sqft = flt(sqm) * 10.7639
        if self.has_value_changed("sqft"):
            sqft = self.sqft or 0
            self.sqm = flt(sqft) / 10.7639

    def on_update(self):
        prp.refetch_resource(self, "doc_update")

    def on_trash(self):
        prp.refetch_resource(self, "list_update")

    def before_insert(self):
        prp.refetch_resource(self, "list_update")
