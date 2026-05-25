function addMsg(text, sender) {
    const div = document.createElement('div');
    const alignClass = sender === 'user' ? 'self-end bg-brandTeal text-white' : 'self-start bg-white text-slate-700';
    const radiusClass = sender === 'user' ? 'rounded-tr-none' : 'rounded-tl-none';
    div.className = `max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm border border-slate-100 ${alignClass} ${radiusClass}`;
    div.innerHTML = text;
    const msgs = document.getElementById('chat-messages');
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

// Export for CommonJS environment (Node.js/Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { addMsg };
}
