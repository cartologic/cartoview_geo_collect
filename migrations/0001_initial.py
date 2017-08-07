# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_manager', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='GeoFormLogo',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('logo', models.BinaryField()),
                ('app_instance', models.ForeignKey(related_name='geoform_logo', to='app_manager.AppInstance')),
            ],
        ),
    ]
