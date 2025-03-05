# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import prp

class PRPPreference(Document):
    def before_save(self):
        if self.has_value_changed("min_sqm"):
            self.min_sqft = self.min_sqm * 10.7639
        if self.has_value_changed("max_sqm"):
            self.max_sqft = self.max_sqm * 10.7639
        if self.has_value_changed("min_sqft"):
            self.min_sqm = self.min_sqft / 10.7639
        if self.has_value_changed("max_sqft"):
            self.max_sqm = self.max_sqft / 10.7639
        if self.has_value_changed("sqm"):
            self.sqft = self.sqm * 10.7639
        if self.has_value_changed("sqft"):
            self.sqm = self.sqft / 10.7639

    def on_update(self):
        prp.refetch_resource(self, "doc_update")

    def on_trash(self):
        prp.refetch_resource(self, "list_update")

    def before_insert(self):
        prp.refetch_resource(self, "list_update")
