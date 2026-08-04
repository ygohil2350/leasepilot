import { Link, useLocation } from 'react-router-dom';
import { selectProperty, toggleFavorite } from '../features/properties/propertiesSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import type { Property } from '../types';
import styles from './PropertyCard.module.css';
export const PropertyCard = ({ property }: { property: Property }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const favorite = useAppSelector((s) => s.properties.favorites.includes(property._id));
  const selected = useAppSelector((s) => s.properties.selectedId === property._id);
  return (
    <article
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onMouseEnter={() => dispatch(selectProperty(property._id))}
    >
      <div className={styles.imageWrap}>
        <img
          loading="lazy"
          src={property.imageUrls[0]}
          alt={`${property.title} exterior`}
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/800x560/dae4df/315a4c?text=LeasePilot';
          }}
        />
        <button
          type="button"
          className={styles.favorite}
          aria-label={favorite ? 'Remove from saved properties' : 'Save property'}
          onClick={() => dispatch(toggleFavorite(property._id))}
        >
          {favorite ? '♥' : '♡'}
        </button>
        <span className={styles.status}>{property.listingStatus}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.price}>
          ${property.monthlyRent.toLocaleString()}
          <span>/mo</span>
        </div>
        <h3>{property.title}</h3>
        <p>
          {property.city}, {property.state}
        </p>
        <div className={styles.specs}>
          <span>{property.bedrooms} bd</span>
          <span>{property.bathrooms} ba</span>
          <span>{property.areaSqFt.toLocaleString()} ft²</span>
        </div>
        <div className={styles.amenities}>
          {property.amenities.slice(0, 2).map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
        <Link
          to={`/properties/${property._id}`}
          state={{ from: `${location.pathname}${location.search}` }}
        >
          View home <span>→</span>
        </Link>
      </div>
    </article>
  );
};
