from enum import Enum
from typing import Union, List
from fastapi import Header, HTTPException, status


class DemoRole(str, Enum):
    VIEWER = "Viewer"
    OPERATOR = "Operator"
    SUPERVISOR = "Supervisor"


def get_current_demo_role(x_demo_role: str | None = Header(default="Viewer")) -> DemoRole:
    try:
        return DemoRole(x_demo_role)
    except ValueError:
        return DemoRole.VIEWER


def require_role(allowed_or_min: Union[DemoRole, str, List[Union[DemoRole, str]]]):
    hierarchy = {
        DemoRole.VIEWER: 1,
        DemoRole.OPERATOR: 2,
        DemoRole.SUPERVISOR: 3,
    }

    def role_dependency(role: DemoRole = Header(default=DemoRole.VIEWER, alias="X-Demo-Role")):
        # Normalize incoming role
        if isinstance(role, str):
            try:
                role = DemoRole(role)
            except ValueError:
                role = DemoRole.VIEWER

        if isinstance(allowed_or_min, (list, tuple, set)):
            allowed_values = [
                r.value if isinstance(r, DemoRole) else str(r)
                for r in allowed_or_min
            ]
            if role.value not in allowed_values:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Action requires one of roles: {allowed_values}. Current role: '{role.value}'."
                )
        else:
            min_target = allowed_or_min if isinstance(allowed_or_min, DemoRole) else DemoRole(allowed_or_min)
            if hierarchy.get(role, 1) < hierarchy.get(min_target, 1):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Action requires at least '{min_target.value}' role. Current role: '{role.value}'."
                )
        return role.value

    return role_dependency
