# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class PRPDocument(Document):
	def validate(self):
		if "cover_image" in self.tags:
			for room in self.rooms:
				if room.rel_doctype == "PRP Project":
					project = frappe.get_doc("PRP Project", room.rel_docname)
					break
			frappe.db.set_value("PRP Project", project.name, "cover_image", self.attach)
			frappe.db.commit()