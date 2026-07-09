import './GalleryPreview.css';

const HEIGHTS = [240, 320, 200, 280, 260, 220, 300, 240, 260, 220, 300, 240];

export default function GalleryPreview() {
  return (
    <section className="section" id="gallery">
      <div className="container">
        <div className="features-header">
          <span className="eyebrow">Sample Gallery</span>
          <h2>Every event photo, organized and ready to be found</h2>
        </div>

        <div className="gallery-masonry">
          {HEIGHTS.map((h, i) => (
            <div className="gallery-item" key={i}>
              <img src={`https://picsum.photos/seed/gallery${i}/400/${h}`} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
