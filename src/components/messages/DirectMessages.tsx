import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";

interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const DirectMessages = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.id);
      markMessagesAsRead(selectedFriend.id);

      // Subscribe to new messages
      const subscription = supabase
        .channel(`direct_messages:${user?.id}:${selectedFriend.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${user?.id}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (newMsg.sender_id === selectedFriend.id) {
              setMessages((prev) => [...prev, newMsg]);
              markMessagesAsRead(selectedFriend.id);
              scrollToBottom();
            }
          },
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedFriend, user]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      // Get follows where the current user is the follower
      const { data, error } = await supabase
        .from("follows")
        .select(
          "following_id, following:profiles!follows_following_id_fkey(id, username, avatar_url)",
        )
        .eq("follower_id", user?.id);

      if (error) throw error;

      if (data) {
        const friendsList: Friend[] = data.map((item) => ({
          id: item.following.id,
          username: item.following.username,
          avatar_url: item.following.avatar_url || undefined,
          last_message: undefined,
          last_message_time: undefined,
          unread_count: 0,
        }));

        // Get last messages and unread counts
        for (const friend of friendsList) {
          const lastMessage = await getLastMessage(friend.id);
          const unreadCount = await getUnreadCount(friend.id);

          friend.last_message = lastMessage?.content;
          friend.last_message_time = lastMessage?.created_at;
          friend.unread_count = unreadCount;
        }

        // Sort by last message time
        friendsList.sort((a, b) => {
          if (!a.last_message_time) return 1;
          if (!b.last_message_time) return -1;
          return (
            new Date(b.last_message_time).getTime() -
            new Date(a.last_message_time).getTime()
          );
        });

        setFriends(friendsList);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLastMessage = async (friendId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
      .or(`sender_id.eq.${friendId},receiver_id.eq.${friendId}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return data as Message | null;
  };

  const getUnreadCount = async (friendId: string) => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact" })
      .eq("sender_id", friendId)
      .eq("receiver_id", user?.id)
      .eq("is_read", false);

    return count || 0;
  };

  const fetchMessages = async (friendId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .or(`sender_id.eq.${friendId},receiver_id.eq.${friendId}`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(data);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessagesAsRead = async (friendId: string) => {
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", friendId)
        .eq("receiver_id", user?.id)
        .eq("is_read", false);

      // Update unread count in UI
      setFriends((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, unread_count: 0 } : f)),
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedFriend) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: selectedFriend.id,
          content: newMessage.trim(),
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMessages((prev) => [...prev, data]);
        setNewMessage("");
        scrollToBottom();

        // Update last message in friends list
        setFriends((prev) =>
          prev.map((f) =>
            f.id === selectedFriend.id
              ? {
                  ...f,
                  last_message: newMessage.trim(),
                  last_message_time: new Date().toISOString(),
                }
              : f,
          ),
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const filteredFriends = searchQuery
    ? friends.filter((friend) =>
        friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : friends;

  return (
    <Card className="w-full h-full bg-card shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Messages</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex h-[500px]">
          {/* Friends list */}
          <div className="w-1/3 border-r border-border">
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="h-[440px]">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No conversations yet.</p>
                </div>
              ) : (
                <div>
                  {filteredFriends.map((friend) => (
                    <button
                      key={friend.id}
                      className={`w-full text-left p-3 hover:bg-muted/50 flex items-center gap-3 ${selectedFriend?.id === friend.id ? "bg-muted" : ""}`}
                      onClick={() => setSelectedFriend(friend)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>
                            {friend.username.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {friend.unread_count ? (
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {friend.unread_count}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium truncate">
                          {friend.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {friend.last_message || "No messages yet"}
                        </p>
                      </div>
                      {friend.last_message_time && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            friend.last_message_time,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat area */}
          <div className="w-2/3 flex flex-col">
            {selectedFriend ? (
              <>
                <div className="p-3 border-b border-border flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedFriend.avatar_url} />
                    <AvatarFallback>
                      {selectedFriend.username.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedFriend.username}</p>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2 ${msg.sender_id === user?.id ? "justify-end" : ""}`}
                        >
                          {msg.sender_id !== user?.id && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedFriend.avatar_url} />
                              <AvatarFallback>
                                {selectedFriend.username.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                          >
                            <p>{msg.content}</p>
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
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectMessages;
