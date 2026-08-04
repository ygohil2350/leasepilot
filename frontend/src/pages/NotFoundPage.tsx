import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div className="page empty">
      <p className="eyebrow">404</p>
      <h1>This door doesn’t lead anywhere.</h1>
      <p>The page may have moved or the address may be incorrect.</p>
      <Link className="button" to="/">
        Return to dashboard
      </Link>
    </div>
  );
}
