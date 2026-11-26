export default function Dashboard() {
  return (
    <div className="dashboard">
      <section className="welcome">
        <p className="eyebrow">YOUR EXAM PREPARATION SPACE</p>
        <h1>Learn a little.<br /><span>Feel more prepared.</span></h1>
        <p className="intro">
          Practise the Leben in Deutschland questions, track your progress and get ready for exam day.
        </p>
        <div className="setup-card">
          <div className="setup-icon" aria-hidden="true">✳</div>
          <div>
            <p className="setup-title">Your learning space is taking shape</p>
            <p className="setup-copy">The new React foundation is in place. Your question practice and saved progress are the next milestones.</p>
          </div>
        </div>
      </section>
      <section className="overview-grid" aria-label="Planned learning tools">
        <article className="overview-card">
          <span className="card-number">01</span>
          <h2>Learn</h2>
          <p>Work through the official question catalogue with translations and explanations.</p>
        </article>
        <article className="overview-card">
          <span className="card-number">02</span>
          <h2>Practise</h2>
          <p>Revise difficult questions and keep track of your learning progress.</p>
        </article>
        <article className="overview-card">
          <span className="card-number">03</span>
          <h2>Mock exam</h2>
          <p>Prepare with a timed test in the real exam format.</p>
        </article>
      </section>
    </div>
  );
}