import type { PackageItem, ParkingTruck } from "./types";

export type PackageResult = { packages: PackageItem[]; parking: ParkingTruck[]; loaded: number };
export const CONVEYOR_PACKAGE_SPACING = 0.068;

export function getVisiblePackageCount(packages: PackageItem[], conveyorProgress: number): number {
  return Math.min(packages.length, Math.floor(conveyorProgress / CONVEYOR_PACKAGE_SPACING) + 1);
}

export function canProcessNextPackage(
  packages: PackageItem[],
  parking: ParkingTruck[],
  availableCount = packages.length
): boolean {
  const availablePackages = packages.slice(0, availableCount);
  return parking.some(
    (truck) => truck.loaded < truck.capacity && availablePackages.some((item) => item.color === truck.color)
  );
}

export function processNextPackage(
  sourcePackages: PackageItem[],
  sourceParking: ParkingTruck[],
  availableCount = sourcePackages.length
): PackageResult {
  const packages = sourcePackages.map((item) => ({ ...item }));
  const parking = sourceParking.map((item) => ({ ...item }));
  const availablePackages = packages.slice(0, availableCount);
  const truckIndex = parking.findIndex((truck) =>
    truck.loaded < truck.capacity && availablePackages.some((item) => item.color === truck.color)
  );
  if (truckIndex < 0) return { packages, parking, loaded: 0 };
  const packageIndex = availablePackages.findIndex((item) => item.color === parking[truckIndex].color);
  packages.splice(packageIndex, 1);
  parking[truckIndex].loaded += 1;
  if (parking[truckIndex].loaded >= parking[truckIndex].capacity) parking.splice(truckIndex, 1);
  return { packages, parking, loaded: 1 };
}

export function processPackageWave(
  sourcePackages: PackageItem[],
  sourceParking: ParkingTruck[],
  availableCount = sourcePackages.length
): PackageResult {
  const packages = sourcePackages.map((item) => ({ ...item }));
  const parking = sourceParking.map((item) => ({ ...item }));
  const reserved = new Set<number>();

  for (const truck of parking) {
    if (truck.loaded >= truck.capacity) continue;
    const packageIndex = packages.findIndex(
      (item, index) => index < availableCount && item.color === truck.color && !reserved.has(index)
    );
    if (packageIndex < 0) continue;
    reserved.add(packageIndex);
    truck.loaded += 1;
  }

  return {
    packages: packages.filter((_, index) => !reserved.has(index)),
    parking: parking.filter((truck) => truck.loaded < truck.capacity),
    loaded: reserved.size
  };
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
