import type { PackageItem, ParkingTruck } from "./types";

export type PackageResult = { packages: PackageItem[]; parking: ParkingTruck[]; loaded: number };

export function processPackages(sourcePackages: PackageItem[], sourceParking: ParkingTruck[]): PackageResult {
  const packages = sourcePackages.map((item) => ({ ...item }));
  const parking = sourceParking.map((item) => ({ ...item }));
  let loaded = 0;
  while (packages.length) {
    const truckIndex = parking.findIndex(
      (truck) => truck.color === packages[0].color && truck.loaded < truck.capacity
    );
    if (truckIndex < 0) break;
    packages.shift();
    parking[truckIndex].loaded += 1;
    loaded += 1;
    if (parking[truckIndex].loaded >= parking[truckIndex].capacity) parking.splice(truckIndex, 1);
  }
  return { packages, parking, loaded };
}
