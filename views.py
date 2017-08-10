
import json

from cartoview.app_manager.models import App, AppInstance
from cartoview.app_manager.views import _resolve_appinstance
from cartoview_attachment_manager.dynamic import create_file_model
from django.contrib.auth.decorators import login_required
from django.shortcuts import HttpResponse, render
from django.views.decorators.csrf import csrf_exempt
from geonode.maps.views import _PERMISSION_MSG_VIEW
from django.core.files.base import ContentFile
from . import APP_NAME, __version__
from PIL import Image
from base64 import b64decode, b64encode
from PIL import Image
import tempfile
import shutil
import os
VIEW_MAP_TPL = "%s/geoform.html" % APP_NAME


@login_required
def collect_data(request, instance_id):
    context = dict(v=__version__)
    return view_app(request, instance_id,
                    template=VIEW_MAP_TPL,
                    context=context)


def generate_thumbnails(base64_image, size=(64, 64)):
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


def save(request, instance_id=None, app_name=APP_NAME):
    res_json = dict(success=False)
    data = json.loads(request.body)
    config = data.get('config', None)
    base64_image = config.get(
        'logo', None).get('base64', None)
    encoded_image = generate_thumbnails(base64_image)
    config['logo']['base64'] = encoded_image
    map_id = data.get('map', None)
    title = data.get('title', "")
    access = data.get('access', None)
    config.update(access=access)
    config = json.dumps(data.get('config', None))
    abstract = data.get('abstract', "")
    keywords = data.get('keywords', [])

    if instance_id is None:
        instance_obj = AppInstance()
        instance_obj.app = App.objects.get(name=app_name)
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

    if access == "private":
        permessions = {
            'users': {
                '{}'.format(request.user): owner_permissions,
            }
        }
    else:
        permessions = {
            'users': {
                '{}'.format(request.user): owner_permissions,
                'AnonymousUser': [
                    'view_resourcebase',
                ],
            }
        }
    # set permissions so that no one can view this appinstance other than
    #  the user
    instance_obj.set_permissions(permessions)

    # update the instance keywords
    if hasattr(instance_obj, 'keywords'):
        for k in keywords:
            if k not in instance_obj.keyword_list():
                instance_obj.keywords.add(k)

    res_json.update(dict(success=True, id=instance_obj.id))
    return HttpResponse(json.dumps(res_json), content_type="application/json")


@login_required
def new(
        request,
        template="%s/new.html" %
        APP_NAME,
        app_name=APP_NAME,
        context={}):
    if request.method == 'POST':
        return save(request, app_name=app_name)
    return render(request, template, context)


@login_required
def edit(request, instance_id, template="%s/edit.html" % APP_NAME, context={}):
    if request.method == 'POST':
        return save(request, instance_id)
    instance = AppInstance.objects.get(pk=instance_id)
    context.update(instance=instance)
    return render(request, template, context)


def view_app(
        request,
        instance_id,
        template="%s/view.html" %
        APP_NAME,
        context={}):
    instance = _resolve_appinstance(
        request, instance_id, 'base.view_resourcebase', _PERMISSION_MSG_VIEW)
    context.update({
        "map_config": instance.map.viewer_json(request.user, None),
        "instance": instance
    })
    return render(request, template, context)


@login_required
@csrf_exempt
def attachment(request):
    res = dict()
    file = request.FILES['file']
    model = create_file_model(request.POST['layer'])
    model.objects.create(file=file.read(), file_name=file.name,
                         user=request.user,
                         feature=request.POST["fid"])
    res["success"] = True
    return HttpResponse(json.dumps(res), content_type="text/json")


class MultiPartResource(object):
    def deserialize(self, request, data, format=None):
        if not format:
            format = request.Meta.get('CONTENT_TYPE', 'application/json')
        if format == 'application/x-www-form-urlencoded':
            return request.POST
        if format.startswith('multipart'):
            data = request.POST.copy()
            data.update(request.FILES)
            return data
        return super(MultiPartResource, self).deserialize(request, data,
                                                          format)
