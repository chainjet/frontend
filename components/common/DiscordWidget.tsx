export function DiscordWidget() {
  return (
    <div className="fixed bottom-4 right-4" style={{ zIndex: 100000000 }}>
      <a href="https://discord.gg/QFnSwqj9YH" target="_blank" rel="noreferrer nofollower">
        <img
          src="https://chainjet.s3.us-west-2.amazonaws.com/images/discord-widget.png"
          alt="Discord Widget"
          width={64}
          height={64}
        />
      </a>
    </div>
  )
}
