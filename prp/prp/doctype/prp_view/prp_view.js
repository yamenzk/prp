frappe.ui.form.on("PRP View", {
	refresh: function (frm) {
		frm.add_custom_button(__("Fetch Fields"), function () {
			if (!frm.doc.for_doctype) {
				frappe.msgprint(__("Please select a DocType first"));
				return;
			}

			frappe.call({
				method: "prp.api.fetch_doctype_fields",
				args: {
					doctype_name: frm.doc.for_doctype,
				},
				callback: function (response) {
					if (response.message) {
						// Clear existing fields
						frm.doc.fields = [];

						// Add each field
						response.message.forEach(function (field) {
							let row = frappe.model.add_child(frm.doc, "PRP Fields", "fields");
							row.fieldname = field.fieldname;
							row.label = field.label;

							// Default values for other columns
							row.allow_filter = 0;
							row.allow_sort = 0;
							row.list_view = 0;
							row.kanban_view = 0;
							row.is_kanban_group = 0;
						});

						frm.refresh_field("fields");
						frappe.show_alert({
							message: __("Fields fetched successfully"),
							indicator: "green",
						});
					}
				},
			});
		});
	},
});
