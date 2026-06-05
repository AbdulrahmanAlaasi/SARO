from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    """Subclass and set `allowed_roles`."""

    allowed_roles: tuple[str, ...] = ()

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role in self.allowed_roles or request.user.is_superuser)
        )


class IsAdmin(RolePermission):
    allowed_roles = ("admin",)


class IsDriver(RolePermission):
    allowed_roles = ("driver",)


class IsCustomer(RolePermission):
    allowed_roles = ("customer",)


class IsAdminOrBranch(RolePermission):
    allowed_roles = ("admin", "branch_supervisor")


class IsStaffSide(RolePermission):
    allowed_roles = ("admin", "branch_supervisor", "driver")
