import { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useTyping } from '../../hooks/useTyping';
import { uploadAttachment } from '../../services/messageService';
import toast from 'react-hot-toast';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChat();
  const { handleTyping, stopTyping } = useTyping();

  const handleSend = async () => {
    if (!text.trim() &&!filePreview) return;
    setSending(true);
    try {
      let options = {};
      if (filePreview) {
        const res = await uploadAttachment(filePreview.file);
        options.file = res.data;
        options.messageType = res.data.type;
      }
      await sendMessage(text, options);
      setText('');
      setFilePreview(null);
      stopTyping();
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  return (
    <div className="bg-white border-t border-gray-200">
      {filePreview && (
        <div className="p-2 border-b flex items-center gap-2">
          <p className="text-xs flex-1 truncate">{filePreview.file.name}</p>
          <button onClick={() => setFilePreview(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      <div className="flex items-end gap-2 p-3">
        <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-lg"><Paperclip className="w-5 h-5" /></button>
        <input ref={fileInputRef} type="file" hidden onChange={(e)=>{
          const f=e.target.files[0]; if(!f) return;
          if(f.size>10*1024*1024) return toast.error('File too large');
          setFilePreview({file:f});
        }} />
        <textarea
          value={text}
          onChange={(e)=>{ setText(e.target.value); handleTyping(); }}
          onKeyDown={(e)=>{ if(e.key==='Enter' &&!e.shiftKey){ e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none max-h-32"
        />
        <button onClick={handleSend} disabled={sending || (!text.trim() &&!filePreview)} className="p-2.5 bg-primary-500 text-white rounded-full disabled:opacity-50"><Send className="w-5 h-5" /></button>
      </div>
    </div>
  );
};
export default MessageInput;