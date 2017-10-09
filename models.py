# -*- coding: utf-8 -*-
from django.db import models
from geonode import settings
from geonode.layers.models import Layer


class UserHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             related_name="collector_history")
    created_at = models.DateTimeField(auto_now_add=True, auto_now=False)
    update = models.DateTimeField(auto_now=True, auto_now_add=False)
    layer = models.ForeignKey(Layer, related_name="collector_history")
    data = models.TextField(blank=False, null=False)

    def __str__(self):
        return self.created_at

    def __unicode__(self):
        return self.created_at.__str__()

    class Meta:
        ordering = ('-created_at',)
