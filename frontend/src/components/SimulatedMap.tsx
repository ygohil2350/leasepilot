import { selectProperty } from '../features/properties/propertiesSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import type { Property } from '../types';
import styles from './SimulatedMap.module.css';
export const SimulatedMap = ({ properties }: { properties: Property[] }) => {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.properties.selectedId);
  return (
    <div className={styles.map} role="region" aria-label="Simulated property map">
      <span className={`${styles.road} ${styles.one}`} />
      <span className={`${styles.road} ${styles.two}`} />
      <span className={`${styles.road} ${styles.three}`} />
      <div className={styles.water} />
      {properties.map((property) => (
        <button
          key={property._id}
          type="button"
          aria-label={`Select ${property.title}, $${property.monthlyRent} monthly`}
          onClick={() => dispatch(selectProperty(property._id))}
          className={`${styles.pin} ${selected === property._id ? styles.active : ''}`}
          style={{ left: `${property.mapPosition.x}%`, top: `${property.mapPosition.y}%` }}
        >
          ${selected === property._id ? `$${Math.round(property.monthlyRent / 100) / 10}k` : '•'}
        </button>
      ))}
    </div>
  );
};
