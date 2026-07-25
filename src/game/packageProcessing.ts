import type { PackageItem, ParkingTruck } from "./types";

export type PackageResult = { packages: PackageItem[]; parking: ParkingTruck[]; loaded: number };

export function canProcessNextPackage(packages: PackageItem[], parking: ParkingTruck[]): boolean {
  return Boolean(packages[0] && parking.some(
    (truck) => truck.color === packages[0].color && truck.loaded < truck.capacity
  ));
}

export function processNextPackage(sourcePackages: PackageItem[], sourceParking: ParkingTruck[]): PackageResult {
  const packages = sourcePackages.map((item) => ({ ...item }));
  const parking = sourceParking.map((item) => ({ ...item }));
  if (!packages.length) return { packages, parking, loaded: 0 };
  const truckIndex = parking.findIndex(
    (truck) => truck.color === packages[0].color && truck.loaded < truck.capacity
  );
  if (truckIndex < 0) return { packages, parking, loaded: 0 };
  packages.shift();
  parking[truckIndex].loaded += 1;
  if (parking[truckIndex].loaded >= parking[truckIndex].capacity) parking.splice(truckIndex, 1);
  return { packages, parking, loaded: 1 };
}

export function processPackages(sourcePackages: PackageItem[], sourceParking: ParkingTruck[]): PackageResult {
  const packages = sourcePackages.map((item) => ({ ...item }));
  const parking = sourceParking.map((item) => ({ ...item }));
  let loaded = 0;
  while (canProcessNextPackage(packages, parking)) {
    const next = processNextPackage(packages, parking);
    packages.splice(0, packages.length, ...next.packages);
    parking.splice(0, parking.length, ...next.parking);
    loaded += next.loaded;
  }
  return { packages, parking, loaded };
}
