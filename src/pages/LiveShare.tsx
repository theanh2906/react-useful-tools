import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, Copy, Send, Upload, Trash2, User, File as FileIcon, Crown } from 'lucide-react';
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
  type RoomMessage 
} from '@/services/liveShareService';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';

export function LiveSharePage() {
  const { roomId: paramRoomId } = useParams();
  const user = useAuthStore((state) => state.user);
  
  const [roomId, setRoomId] = useState('');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [files, setFiles] = useState<RoomFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const roomUrl = useMemo(() => {
    return activeRoom ? `${window.location.origin}/live-share/room/${activeRoom}` : '';
  }, [activeRoom]);

  // Effect to auto-join Admin Room if logged in
  useEffect(() => {
    if (user?.id && !paramRoomId) { // Only if not navigating to specific room via URL
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
      toast.info("You are using your personal Admin Room");
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

    listenRoomMessages(activeRoom, (data) => setMessages(data)).then((unsub) => {
      unsubscribeMessages = unsub;
    });
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-white flex items-center gap-3">
          Live Share 
          {isAdminRoom && <Badge variant="warning" className="text-sm"><Crown className="w-3 h-3 mr-1"/> Admin Mode</Badge>}
        </h1>
        <p className="text-slate-400 mt-1">Share text and files in real-time</p>
      </div>

      <Card className="p-6 space-y-4">
        {user ? (
           <div className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-primary-300 font-medium flex items-center gap-2">
                  <User className="w-4 h-4" /> Personal Admin Room
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  You are in your persistent room. Share your Room ID with others to invite them.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono text-white block">{activeRoom}</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-sm text-slate-300">
              Sharing Link: <span className="text-blue-400 underline cursor-pointer" onClick={() => window.open(roomUrl, '_blank')}>{roomUrl}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={async () => {
                await navigator.clipboard.writeText(roomUrl);
                toast.success('Room link copied');
              }}>
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
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.author === (user?.displayName || 'You'); // Simplified check
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-xl border ${
                        msg.isAdmin 
                          ? 'bg-primary-500/20 border-primary-500/30' 
                          : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="flex items-center justify-between gap-4 text-xs text-slate-500 mb-1">
                          <span className={`${msg.isAdmin ? 'text-primary-300 font-medium' : ''}`}>
                            {msg.author}
                          </span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-white/10">
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
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No files shared yet.
              </div>
            ) : (
              files.map((file) => (
                <div key={file.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <FileIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)} • {new Date(file.timestamp).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => window.open(file.url, '_blank')}>
                    Open
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-white/10">
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
              <Button variant="secondary" className="w-full" disabled={!activeRoom || isProcessing}>
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
