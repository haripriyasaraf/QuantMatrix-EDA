from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalesDataViewSet

router = DefaultRouter()
router.register(r'sales', SalesDataViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
