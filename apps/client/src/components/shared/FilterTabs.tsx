import { IonBadge, IonSegment, IonSegmentButton } from '@ionic/react';

export type FilterOption<T extends string> = { value: T; label: string; count: number; color: string };

export function FilterTabs<T extends string>({ options, value, onChange }: {
  options: FilterOption<T>[]; value: T; onChange: (value: T) => void;
}) {
  return <IonSegment className="filter-tabs" scrollable value={value} onIonChange={(event) => {
    if (event.detail.value) onChange(event.detail.value as T);
  }}>
    {options.map((option) => <IonSegmentButton key={option.value} value={option.value}>
      <span className="filter-tab"><span>{option.label}</span><IonBadge className="count-badge" color={option.color}>{option.count}</IonBadge></span>
    </IonSegmentButton>)}
  </IonSegment>;
}
