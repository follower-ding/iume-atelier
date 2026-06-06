const EMOJIS = ['😀', '😂', '🥰', '🤔', '👍', '🎉', '🔥', '✨', '💡', '🚀', '❤️', '👀', '🙌', '💯', '🎨', '⚡']

interface EmojiPickerProps {
  onPick: (emoji: string) => void
}

export default function EmojiPicker({ onPick }: EmojiPickerProps) {
  return (
    <div className="emoji-picker" role="group" aria-label="表情">
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          className="emoji-picker__btn click-particles-ignore"
          onClick={() => onPick(e)}
        >
          {e}
        </button>
      ))}
    </div>
  )
}
