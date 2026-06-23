from django import template

register = template.Library()


@register.filter
def absolute_url(value, request):
    """Make a (possibly relative) URL absolute against the current request.

    Leaves already-absolute URLs (http://, https://, //) untouched. Used so an
    uploaded media path like /media/profile/x.jpg becomes a full https:// URL for
    Open Graph / Twitter / JSON-LD, which require absolute image URLs.
    """
    if not value:
        return value
    if "://" in value or value.startswith("//"):
        return value
    return request.build_absolute_uri(value)
