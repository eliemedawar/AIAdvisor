from django.urls import path

from .views import (
    ConversationApplyActionsView,
    ConversationListCreateView,
    ConversationMessagesView,
)

urlpatterns = [
    path(
        "conversations/",
        ConversationListCreateView.as_view(),
        name="advisor-conversations",
    ),
    path(
        "conversations/<int:pk>/messages/",
        ConversationMessagesView.as_view(),
        name="advisor-conversation-messages",
    ),
    path(
        "conversations/<int:pk>/apply-actions/",
        ConversationApplyActionsView.as_view(),
        name="advisor-conversation-apply-actions",
    ),
]
