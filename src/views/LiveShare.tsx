/**
 * @module LiveSharePage
 * @description Real-time collaborative sharing room with text messages and file uploads
 * backed by Firebase Realtime Database and Storage.
 */
import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Share2,
  Copy,
  Send,
  Upload,
  Trash2,
  User,
  File as FileIcon,
  Crown,
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { formatFileSize } from '@/lib/utils';
import {
  addMessage,
  clearRoom,
  listenRoomFiles,
  listenRoomMessages,
  uploadRoomFile,
  getAdminRoomId,
  type RoomFile,
  type RoomMessage,
} from '@/services/liveShareService';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';

/**
 * Live Share page.
 * Creates or joins a shareable room with real-time messaging and file sharing.
 * Room ownership is determined by the admin room ID.
 */
export function LiveSharePage() {
  const params = useParams();
  const paramRoomId = params?.roomId as string | undefined;
  const user = useAuthStore((state) => state.user);

  const [roomId, setRoomId] = useState('');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [files, setFiles] = useState<RoomFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const roomUrl = useMemo(() => {
    return activeRoom
      ? `${window.location.origin}/live-share/room/${activeRoom}`
      : '';
  }, [activeRoom]);

  // Effect to auto-join Admin Room if logged in
  useEffect(() => {
    if (user?.id && !paramRoomId) {
      // Only if not navigating to specific room via URL
      const adminRoom = getAdminRoomId(user.id);
      setActiveRoom(adminRoom);
      setRoomId(adminRoom);
    }
  }, [user?.id, paramRoomId]);

  // Effect to handle URL params
  useEffect(() => {
    if (paramRoomId) {
      setRoomId(paramRoomId);
      setActiveRoom(paramRoomId);
    }
  }, [paramRoomId]);

  const createRoom = () => {
    if (user) {
      toast.info('You are using your personal Admin Room');
      return;
    }
    const id = Math.random().toString(36).slice(2, 10);
    setActiveRoom(id);
    setRoomId(id);
    toast.success('Temporary room created');
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      toast.error('Enter a room ID');
      return;
    }
    setActiveRoom(roomId.trim());
    toast.success('Joined room');
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!activeRoom) return;

    try {
      await addMessage(activeRoom, {
        content: message.trim(),
        timestamp: Date.now(),
        author: user?.displayName || 'Anonymous',
        isAdmin: !!user,
      });
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleUpload = async (file: File) => {
    if (!activeRoom) return;
    setIsProcessing(true);
    try {
      await uploadRoomFile(activeRoom, file);
      toast.success('File added to room');
    } catch (error) {
      console.error(error);
      toast.error('Upload failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearHistory = async () => {
    if (!activeRoom) return;
    if (confirm('Are you sure you want to clear all history?')) {
      await clearRoom(activeRoom);
      toast.success('Room cleared');
    }
  };

  useEffect(() => {
    if (!activeRoom) return;
    setMessages([]); // Clear previous state
    setFiles([]);

    let unsubscribeMessages: (() => void) | null = null;
    let unsubscribeFiles: (() => void) | null = null;

    listenRoomMessages(activeRoom, (data) => setMessages(data)).then(
      (unsub) => {
        unsubscribeMessages = unsub;
      }
    );
    listenRoomFiles(activeRoom, (data) => setFiles(data)).then((unsub) => {
      unsubscribeFiles = unsub;
    });

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeFiles) unsubscribeFiles();
    };
  }, [activeRoom]);

  const isAdminRoom = user && activeRoom === getAdminRoomId(user.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="flex items-center gap-3 font-display text-2xl font-bold text-foreground lg:text-3xl">
          Live Share
          {isAdminRoom && (
            <Badge variant="warning" className="text-sm">
              <Crown className="w-3 h-3 mr-1" /> Admin Mode
            </Badge>
          )}
        </h1>
        <p className="mt-1 text-muted">Share text and files in real-time</p>
      </div>

      <Card className="p-6 space-y-4">
        {user ? (
          <div className="flex items-center justify-between rounded-lg border border-accent-200 bg-accent-50 p-4">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-accent-700">
                <User className="w-4 h-4" /> Personal Admin Room
              </h3>
              <p className="mt-1 text-sm text-muted">
                You are in your persistent room. Share your Room ID with others
                to invite them.
              </p>
            </div>
            <div className="text-right">
              <span className="block font-mono text-2xl text-foreground">
                {activeRoom}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              label="Room ID"
              placeholder="Enter or create a room"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <div className="flex gap-2 self-end">
              <Button variant="secondary" onClick={createRoom}>
                <Share2 className="w-4 h-4" />
                Create Random
              </Button>
              <Button onClick={joinRoom}>
                <User className="w-4 h-4" />
                Join
              </Button>
            </div>
          </div>
        )}

        {activeRoom && (
          <div className="flex flex-col justify-between gap-2 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-center">
            <div className="min-w-0 text-sm text-foreground">
              Sharing Link:{' '}
              <span
                className="cursor-pointer break-all text-accent-600 underline"
                onClick={() => window.open(roomUrl, '_blank')}
              >
                {roomUrl}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(roomUrl);
                  toast.success('Room link copied');
                }}
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 flex flex-col h-[500px]">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Messages</Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.author === (user?.displayName || 'You'); // Simplified check
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg border p-3 ${
                        msg.isAdmin
                          ? 'border-accent-200 bg-accent-50'
                          : 'border-line bg-surface'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-4 text-xs text-muted">
                        <span
                          className={`${msg.isAdmin ? 'font-medium text-accent-700' : ''}`}
                        >
                          {msg.author}
                        </span>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-foreground">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex gap-2 border-t border-line pt-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!activeRoom}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4 h-[500px] flex flex-col">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Files</Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {files.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                No files shared yet.
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-50">
                    <FileIcon className="h-5 w-5 text-accent-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatFileSize(file.size)} •{' '}
                      {new Date(file.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    Open
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-line pt-2">
            <input
              type="file"
              id="live-share-file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              disabled={!activeRoom || isProcessing}
            />
            <label htmlFor="live-share-file">
              <Button
                variant="secondary"
                className="w-full"
                disabled={!activeRoom || isProcessing}
              >
                <Upload className="w-4 h-4" />
                {isProcessing ? 'Uploading...' : 'Upload File'}
              </Button>
            </label>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

export default LiveSharePage;
