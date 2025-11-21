from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    # API routes
    path("api/", include("accounts.urls")),
    path("api/profile/", include("profiles.urls")),
    path("api/planner/", include("planner.urls")),
    path("api/advisor/", include("advisor.urls")),
    path("api/dashboard/", include("dashboard.urls")),
]


