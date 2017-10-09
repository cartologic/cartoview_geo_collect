# -*- coding: utf-8 -*-
import json

from django.shortcuts import get_object_or_404
from geonode.api.resourcebase_api import LayerResource
from geonode.layers.models import Layer
from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie.resources import ModelResource

from .models import UserHistory


class CollectorHistoryResource(ModelResource):
    user = fields.DictField(null=False, blank=False)
    layer = fields.ForeignKey(LayerResource, 'layer', null=False, blank=False)

    def dehydrate_user(self, bundle):
        return {'username': bundle.obj.user.username, 'id': bundle.obj.user.id}

    def dehydrate_layer(self, bundle):
        return {'title': bundle.obj.layer.title,
                'typename': bundle.obj.layer.typename}

    def dehydrate_data(self, bundle):
        return json.loads(bundle.obj.data, None)

    def hydrate_user(self, bundle):
        bundle.obj.user = bundle.request.user
        return bundle

    def hydrate_data(self, bundle):
        bundle.data["data"] = json.dumps(bundle.data.get('data', None))
        return bundle

    def hydrate_layer(self, bundle):
        layer = get_object_or_404(
            Layer, typename=bundle.data.pop('layer', None))
        bundle.obj.layer = layer
        return bundle

    class Meta:
        queryset = UserHistory.objects.all()
        authorization = Authorization()
        allowed_methods = ['get', 'post', 'put']
        filtering = {'user': ALL_WITH_RELATIONS,
                     'layer': ALL_WITH_RELATIONS,
                     'created_at': ALL,
                     'updated': ALL
                     }
        resource_name = 'collector_history'
        ordering = ['created_at', ]
