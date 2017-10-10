# -*- coding: utf-8 -*-
import json
import os
import shutil
import tempfile
from base64 import b64decode, b64encode

from cartoview.app_manager.models import App, AppInstance
from cartoview.app_manager.views import StandardAppViews
from django.conf.urls import include, patterns, url
from django.shortcuts import HttpResponse
from PIL import Image
from tastypie.api import Api

from . import APP_NAME


def generate_thumbnails(base64_image, size=(250, 250)):
    format, image = base64_image.split(';base64,')
    image = b64decode(image)
    dirpath = tempfile.mkdtemp()
    original_path = os.path.join(dirpath, 'original.png')
    thumbnail_path = os.path.join(dirpath, 'thumbnail.png')
    with open(original_path, 'wb') as f:
        f.write(image)
    im = Image.open(original_path)
    im.thumbnail(size)
    im.save(thumbnail_path, "PNG")
    with open(thumbnail_path, "rb") as image_file:
        encoded_image = b64encode(image_file.read())
    shutil.rmtree(dirpath)
    return format + ';base64,' + encoded_image


class GeoCollect(StandardAppViews):
    def save(self, request, instance_id=None):
        res_json = dict(success=False)
        data = json.loads(request.body)
        print(data)
        config = data.get('config', None)
        base64_image = config.get(
            'logo', None)
        if base64_image:
            logo = base64_image.get('base64', None)
            encoded_image = generate_thumbnails(logo)
            config['logo']['base64'] = encoded_image
        map_id = data.get('map', None)
        title = data.get('title', "")
        access = data.get('access', None)
        keywords = data.get('keywords', [])
        config.update(access=access, keywords=keywords)
        config = json.dumps(data.get('config', None))
        abstract = data.get('abstract', "")

        if instance_id is None:
            instance_obj = AppInstance()
            instance_obj.app = App.objects.get(name=self.app_name)
            instance_obj.owner = request.user
        else:
            instance_obj = AppInstance.objects.get(pk=instance_id)

        instance_obj.title = title
        instance_obj.config = config
        instance_obj.abstract = abstract
        instance_obj.map_id = map_id
        instance_obj.save()

        owner_permissions = [
            'view_resourcebase',
            'download_resourcebase',
            'change_resourcebase_metadata',
            'change_resourcebase',
            'delete_resourcebase',
            'change_resourcebase_permissions',
            'publish_resourcebase',
        ]
        # access limited to specific users
        users_permissions = {'{}'.format(request.user): owner_permissions}
        for user in access:
            if isinstance(user, dict) and \
                    user.get('value', None) != request.user.username:
                users_permissions.update(
                    {user.get('value', None): ['view_resourcebase', ]})
        permessions = {
            'users': users_permissions
        }
        # set permissions so that no one can view this appinstance other than
        #  the user
        instance_obj.set_permissions(permessions)

        # update the instance keywords
        if hasattr(instance_obj, 'keywords') and keywords:
            new_keywords = [k.get('value', None) for k in keywords if k.get(
                'value', None) not in instance_obj.keyword_list()]
            instance_obj.keywords.add(*new_keywords)

        res_json.update(dict(success=True, id=instance_obj.id))
        return HttpResponse(json.dumps(res_json),
                            content_type="application/json")

    def __init__(self, app_name):
        super(GeoCollect, self).__init__(app_name)
        self.view_template = "%s/geoCollect.html" % app_name

    def get_url_patterns(self):
        from .rest import CollectorHistoryResource
        v1_api = Api(api_name='collector_api')
        v1_api.register(CollectorHistoryResource())
        return patterns('',
                        url(r'^new/$', self.new,
                            name='%s.new' % self.app_name),
                        url(r'^(?P<instance_id>\d+)/edit/$',
                            self.edit, name='%s.edit' % self.app_name),
                        url(r'^(?P<instance_id>\d+)/view/$',
                            self.view_app,
                            name='%s.view' % self.app_name),
                        url(r'^api/', include(v1_api.urls))
                        )


geo_collect = GeoCollect(APP_NAME)
