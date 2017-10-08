# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('layers', '24_to_26'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserHistory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('update', models.DateTimeField(auto_now=True)),
                ('data', models.TextField()),
                ('layer', models.ForeignKey(related_name='collector_history', to='layers.Layer')),
                ('user', models.ForeignKey(related_name='collector_history', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
