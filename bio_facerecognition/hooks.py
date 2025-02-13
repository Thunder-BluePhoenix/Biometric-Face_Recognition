app_name = "bio_facerecognition"
app_title = "Bio Facerecognition"
app_publisher = "BluePhoenix"
app_description = "Biometric facial recognition system."
app_email = "bluephoenix00995@gmail.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/bio_facerecognition/css/bio_facerecognition.css"
# app_include_js = "/assets/bio_facerecognition/js/bio_facerecognition.js"

# include js, css files in header of web template
# web_include_css = "/assets/bio_facerecognition/css/bio_facerecognition.css"
# web_include_js = "/assets/bio_facerecognition/js/bio_facerecognition.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "bio_facerecognition/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {"Laborers attendance log" : "public/js/attandance_log.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "bio_facerecognition.utils.jinja_methods",
# 	"filters": "bio_facerecognition.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "bio_facerecognition.install.before_install"
# after_install = "bio_facerecognition.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "bio_facerecognition.uninstall.before_uninstall"
# after_uninstall = "bio_facerecognition.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "bio_facerecognition.utils.before_app_install"
# after_app_install = "bio_facerecognition.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "bio_facerecognition.utils.before_app_uninstall"
# after_app_uninstall = "bio_facerecognition.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "bio_facerecognition.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

doc_events = {
    "Laborers attendance log": {
        "before_save": "bio_facerecognition.override.laborers_attendance_log.check_verifed"
}
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"bio_facerecognition.tasks.all"
# 	],
# 	"daily": [
# 		"bio_facerecognition.tasks.daily"
# 	],
# 	"hourly": [
# 		"bio_facerecognition.tasks.hourly"
# 	],
# 	"weekly": [
# 		"bio_facerecognition.tasks.weekly"
# 	],
# 	"monthly": [
# 		"bio_facerecognition.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "bio_facerecognition.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "bio_facerecognition.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "bio_facerecognition.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["bio_facerecognition.utils.before_request"]
# after_request = ["bio_facerecognition.utils.after_request"]

# Job Events
# ----------
# before_job = ["bio_facerecognition.utils.before_job"]
# after_job = ["bio_facerecognition.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"bio_facerecognition.auth.validate"
# ]
