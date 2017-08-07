from django.db import models
from cartoview.app_manager.models import AppInstance


class GeoFormLogo(models.Model):
    logo = models.BinaryField(null=False, blank=False)
    app_instance = models.OneToOneField(
        AppInstance, related_name="geoform_logo")
