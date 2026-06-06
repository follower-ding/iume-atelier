export default function WorkspaceArt() {
  return (
    <div className="workspace-art" aria-hidden="true">
      <div className="workspace-art__desk" />
      <div className="workspace-art__monitor">
        <div className="workspace-art__screen">
          <span className="workspace-art__code" />
          <span className="workspace-art__code workspace-art__code--short" />
          <span className="workspace-art__code workspace-art__code--accent" />
        </div>
      </div>
      <div className="workspace-art__mug" />
      <div className="workspace-art__plant" />
      <div className="workspace-art__glow" />
    </div>
  )
}
