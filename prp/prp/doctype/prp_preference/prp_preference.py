# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class PRPPreference(Document):
	def on_update(self):
		if self.has_value_changed('min_sqm'):
			self.min_sqft = self.min_sqm * 10.7639
		if self.has_value_changed('max_sqm'):
			self.max_sqft = self.max_sqm * 10.7639
		if self.has_value_changed('min_sqft'):
			self.min_sqm = self.min_sqft / 10.7639
		if self.has_value_changed('max_sqft'):
			self.max_sqm = self.max_sqft / 10.7639
		if self.has_value_changed('sqm'):
			self.sqft = self.sqm * 10.7639
		if self.has_value_changed('sqft'):
			self.sqm = self.sqft / 10.7639
