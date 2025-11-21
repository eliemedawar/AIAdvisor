from __future__ import annotations

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListCreateView(generics.ListCreateAPIView):
    """
    List and create conversations for the authenticated user.
    """

    serializer_class = ConversationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user).order_by(
            "-updated_at",
            "-created_at",
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ConversationMessagesView(APIView):
    """
    List and send messages within a conversation.

    POST will create a user message and an immediate placeholder assistant
    response.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get_conversation(self, pk: int) -> Conversation:
        return get_object_or_404(Conversation, pk=pk, user=self.request.user)

    def get(self, request, pk: int, *args, **kwargs):
        conversation = self.get_conversation(pk)
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk: int, *args, **kwargs):
        conversation = self.get_conversation(pk)
        content = request.data.get("content")
        if not content:
            return Response(
                {"detail": "Content is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_message = Message.objects.create(
            conversation=conversation,
            role=Message.ROLE_USER,
            content=content,
        )
        assistant_message = Message.objects.create(
            conversation=conversation,
            role=Message.ROLE_ASSISTANT,
            content=(
                "I'm your AI Academic Advisor. This is a placeholder response "
                "for now. In a future version I will provide personalized "
                "academic guidance based on your data."
            ),
        )

        serializer = MessageSerializer([user_message, assistant_message], many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk: int, *args, **kwargs):
        conversation = self.get_conversation(pk)
        conversation.messages.all().delete()
        conversation.updated_at = timezone.now()
        conversation.save(update_fields=("updated_at",))
        return Response(status=status.HTTP_204_NO_CONTENT)


