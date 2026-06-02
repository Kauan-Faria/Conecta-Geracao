enum MessageRole { user, assistant }

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    required this.createdAt,
  });

  final String id;
  final MessageRole role;
  final String content;
  final DateTime createdAt;

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      role: MessageRole.values.byName(json['role'] as String),
      content: json['content'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'role': role.name,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  ChatMessage copyWith({
    String? id,
    MessageRole? role,
    String? content,
    DateTime? createdAt,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      role: role ?? this.role,
      content: content ?? this.content,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

class ConversationSummary {
  const ConversationSummary({
    required this.id,
    required this.topicSlug,
    required this.status,
    required this.currentStep,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String? topicSlug;
  final String status;
  final int currentStep;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory ConversationSummary.fromJson(Map<String, dynamic> json) {
    return ConversationSummary(
      id: json['id'] as String,
      topicSlug: json['topicSlug'] as String?,
      status: json['status'] as String,
      currentStep: json['currentStep'] as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'topicSlug': topicSlug,
      'status': status,
      'currentStep': currentStep,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class ConversationDetail extends ConversationSummary {
  const ConversationDetail({
    required super.id,
    required super.topicSlug,
    required super.status,
    required super.currentStep,
    required super.createdAt,
    required super.updatedAt,
    required this.messages,
  });

  final List<ChatMessage> messages;

  factory ConversationDetail.fromJson(Map<String, dynamic> json) {
    final messagesRaw = json['messages'] as List<dynamic>? ?? [];
    return ConversationDetail(
      id: json['id'] as String,
      topicSlug: json['topicSlug'] as String?,
      status: json['status'] as String,
      currentStep: json['currentStep'] as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      messages: messagesRaw
          .whereType<Map<String, dynamic>>()
          .map(ChatMessage.fromJson)
          .toList(),
    );
  }

  @override
  Map<String, dynamic> toJson() {
    return {
      ...super.toJson(),
      'messages': messages.map((m) => m.toJson()).toList(),
    };
  }
}
