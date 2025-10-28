import React from 'react';
import { EMOJIS } from '../constants';

interface EmojiStickerPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EmojiStickerPicker: React.FC<EmojiStickerPickerProps> = ({ onSelect, onClose }) => {

    const handleEmojiClick = (emoji: string) => {
        onSelect(emoji);
        onClose();
    }

    return (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-black/50 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-20 p-2">
            <div className="grid grid-cols-4 gap-2">
                {EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-2xl rounded-lg hover:bg-white/20 transition-colors p-1"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EmojiStickerPicker;
