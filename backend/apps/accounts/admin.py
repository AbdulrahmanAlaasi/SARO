from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User

UserAdmin.fieldsets = UserAdmin.fieldsets + (
    ("SARO", {"fields": ("role", "phone", "preferred_language")}),
)
admin.site.register(User, UserAdmin)
