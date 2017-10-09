# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cartoview_geo_collect', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='userhistory',
            options={'ordering': ('-created_at',)},
        ),
    ]
