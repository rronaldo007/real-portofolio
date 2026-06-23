"""Render admin-authored Markdown (e.g. Project.case_study_body) to HTML.

Content is trusted (only staff edit it via the admin), so the output is
marked safe. Keep the extension set small and predictable.
"""

import markdown as _markdown
from django import template
from django.utils.safestring import mark_safe

register = template.Library()

_MD = _markdown.Markdown(extensions=["extra", "sane_lists"], output_format="html")


@register.filter(name="markdownify")
def markdownify(value):
    if not value:
        return ""
    _MD.reset()
    return mark_safe(_MD.convert(value))
