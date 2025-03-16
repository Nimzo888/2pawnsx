import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

interface GameChatProps {
  gameId: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const GameChat = ({ gameId, isOpen = true }: GameChatProps) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameId) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("game_chat")
          .select(
            "*, profile:profiles!game_chat_user_id_fkey(username, avatar_url)",
          )
          .eq("game_id", gameId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data) {
          const formattedMessages = data.map((msg) => ({
            ...msg,
            username: msg.profile?.username,
            avatar_url: msg.profile?.avatar_url,
          }));
          setMessages(formattedMessages);
          scrollToBottom();
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`game_chat:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_chat",
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;

          // Fetch user details for the new message
          const { data, error } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", newMsg.user_id)
            .single();

          if (!error && data) {
            setMessages((prev) => [
              ...prev,
              {
                ...newMsg,
                username: data.username,
                avatar_url: data.avatar_url,
              },
            ]);
            scrollToBottom();
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !gameId) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("game_chat").insert({
        game_id: gameId,
        user_id: user.id,
        message: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full h-full flex flex-col bg-card shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Game Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4 h-[300px]">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${msg.user_id === user?.id ? "justify-end" : ""}`}
                >
                  {msg.user_id !== user?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.avatar_url} />
                      <AvatarFallback>
                        {msg.username?.substring(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {msg.user_id !== user?.id && (
                      <p className="text-xs font-medium mb-1">{msg.username}</p>
                    )}
                    <p>{msg.message}</p>
                    <span className="text-xs opacity-70 block text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-border flex gap-2"
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GameChat;
