type Story = { id: number; title: string; body: string; image_url?: string | null };
export default function StoryCard({ story }: { story?: Story | null }) {
  if (!story) return null;
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{story.title}</h2>
      {story.image_url ? <div className="story"><img src={story.image_url} alt="" loading="lazy" /></div> : null}
      <div className="story">{story.body}</div>
    </div>
  );
}
