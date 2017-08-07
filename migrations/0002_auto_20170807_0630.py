# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cartoview_geoform', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='geoformlogo',
            name='app_instance',
            field=models.OneToOneField(related_name='geoform_logo', to='app_manager.AppInstance'),
        ),
    ]
