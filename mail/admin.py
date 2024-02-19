from django.contrib import admin
from .models import Email

class EmailAdmin(admin.ModelAdmin):
    list_display = ("subject", "timestamp", "read", "archived")

# Register your models here.
admin.site.register(Email, EmailAdmin)