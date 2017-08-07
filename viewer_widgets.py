from django.templatetags.static import static
from . import APP_NAME

widgets = [{
    'title': 'Geoform',
    'name': 'geoform',
    'config': {
        'directive': 'geoform-config',
        'dependencies': ["dndLists"],
        'js': [
            static("%s/config/directive.js" % APP_NAME),
            static("%s/config/vendor/angular-drag-and-drop-lists.min.js" % APP_NAME),
        ],
        "css": [
            static("%s/config/config.css" % APP_NAME),
        ]
    },
}]
