# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cartoview_geoform', '0002_auto_20170807_0630'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='geoformlogo',
            name='app_instance',
        ),
        migrations.DeleteModel(
            name='GeoFormLogo',
        ),
    ]
