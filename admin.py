from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from builtins import *

from django.contrib import admin
from future import standard_library

from .models import UserHistory

standard_library.install_aliases()


@admin.register(UserHistory)
class CollectorHistoryAdmin(admin.ModelAdmin):
    ordering = ('-created_at',)
