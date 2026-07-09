from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PasswordResetToken


class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('email', 'name', 'role', 'is_active', 'is_verified', 'created_at')
    list_filter = ('role', 'is_active', 'is_verified')
    search_fields = ('email', 'name')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'phone', 'avatar')}),
        ('Role & Status', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_verified')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'created_at')}),
    )
    add_fieldsets = (
        (None, {'fields': ('email', 'name', 'password1', 'password2', 'role')}),
    )
    readonly_fields = ('created_at',)


admin.site.register(User, UserAdmin)
admin.site.register(PasswordResetToken)
