import { useMemo } from "react";
import { BoxGeometry, EdgesGeometry } from "three";
import { CONFIG } from "../simulation/config";

export function BoundaryBox() {
  const edgesGeo = useMemo(
    () => new EdgesGeometry(new BoxGeometry(CONFIG.BOUNDS, CONFIG.BOUNDS, CONFIG.BOUNDS)),
    []
  );

  return (
    <lineSegments geometry={edgesGeo}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
    </lineSegments>
  );
}
