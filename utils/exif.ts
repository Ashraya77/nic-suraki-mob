import * as FileSystem from "expo-file-system/legacy";

type ExifCoordinatePart =
  | number
  | string
  | {
      numerator?: number;
      denominator?: number;
    };

export interface ExifLike {
  GPSLatitude?: unknown;
  GPSLongitude?: unknown;
  GPSLatitudeRef?: unknown;
  GPSLongitudeRef?: unknown;
}

export interface MediaLocationLike {
  latitude?: unknown;
  longitude?: unknown;
}

interface ExifGpsData {
  GPSLatitude?: number[];
  GPSLongitude?: number[];
  GPSLatitudeRef?: string;
  GPSLongitudeRef?: string;
}

const toNumber = (value: ExifCoordinatePart): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const ratioMatch = value.trim().match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (ratioMatch) {
      const numerator = Number(ratioMatch[1]);
      const denominator = Number(ratioMatch[2]);
      return denominator !== 0 ? numerator / denominator : null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (value && typeof value === "object") {
    const numerator = Number(value.numerator);
    const denominator = Number(value.denominator);
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
  }

  return null;
};

const toDecimalCoordinate = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const direct = Number(trimmed);
    if (Number.isFinite(direct)) return direct;

    const parts = trimmed.split(/[,\s]+/).filter(Boolean).map(toNumber);
    if (parts.length === 3 && parts.every((part) => part != null)) {
      const [degrees, minutes, seconds] = parts as [number, number, number];
      return Math.abs(degrees) + minutes / 60 + seconds / 3600;
    }

    return null;
  }

  if (Array.isArray(value)) {
    const parts = value.map((part) => toNumber(part as ExifCoordinatePart));
    if (parts.length === 3 && parts.every((part) => part != null)) {
      const [degrees, minutes, seconds] = parts as [number, number, number];
      return Math.abs(degrees) + minutes / 60 + seconds / 3600;
    }
  }

  return null;
};

const applyHemisphere = (value: number | null, ref: unknown): number | null => {
  if (value == null) return null;

  const hemisphere = typeof ref === "string" ? ref.toUpperCase() : "";
  if (hemisphere === "S" || hemisphere === "W") {
    return -Math.abs(value);
  }

  return value;
};

const isUsableCoordinatePair = (
  latitude: number | null,
  longitude: number | null,
): boolean =>
  latitude != null &&
  longitude != null &&
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  !(latitude === 0 && longitude === 0);

export const getCoordinatesFromExif = (
  exif: ExifLike | null | undefined,
): { latitude: number; longitude: number } | null => {
  const latitude = applyHemisphere(
    toDecimalCoordinate(exif?.GPSLatitude),
    exif?.GPSLatitudeRef,
  );
  const longitude = applyHemisphere(
    toDecimalCoordinate(exif?.GPSLongitude),
    exif?.GPSLongitudeRef,
  );

  if (!isUsableCoordinatePair(latitude, longitude)) return null;

  return { latitude: latitude as number, longitude: longitude as number };
};

export const getCoordinatesFromMediaLocation = (
  location: MediaLocationLike | null | undefined,
): { latitude: number; longitude: number } | null => {
  const latitude =
    typeof location?.latitude === "number" && Number.isFinite(location.latitude)
      ? location.latitude
      : null;
  const longitude =
    typeof location?.longitude === "number" && Number.isFinite(location.longitude)
      ? location.longitude
      : null;

  if (!isUsableCoordinatePair(latitude, longitude)) return null;

  return { latitude: latitude as number, longitude: longitude as number };
};

const base64Chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const base64ToBytes = (value: string): Uint8Array => {
  const sanitized = value.replace(/[^A-Za-z0-9+/=]/g, "");
  const output: number[] = [];

  for (let index = 0; index < sanitized.length; index += 4) {
    const encoded1 = base64Chars.indexOf(sanitized[index] ?? "A");
    const encoded2 = base64Chars.indexOf(sanitized[index + 1] ?? "A");
    const encoded3 = sanitized[index + 2] === "=" ? 64 : base64Chars.indexOf(sanitized[index + 2] ?? "A");
    const encoded4 = sanitized[index + 3] === "=" ? 64 : base64Chars.indexOf(sanitized[index + 3] ?? "A");

    const byte1 = (encoded1 << 2) | (encoded2 >> 4);
    output.push(byte1 & 0xff);

    if (encoded3 !== 64) {
      const byte2 = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      output.push(byte2 & 0xff);
    }

    if (encoded4 !== 64) {
      const byte3 = ((encoded3 & 3) << 6) | encoded4;
      output.push(byte3 & 0xff);
    }
  }

  return Uint8Array.from(output);
};

const readUint16 = (bytes: Uint8Array, offset: number, littleEndian: boolean): number =>
  littleEndian
    ? bytes[offset] | (bytes[offset + 1] << 8)
    : (bytes[offset] << 8) | bytes[offset + 1];

const readUint32 = (bytes: Uint8Array, offset: number, littleEndian: boolean): number =>
  (littleEndian
    ? bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)
    : (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>> 0;

const getTypeSize = (type: number): number => {
  switch (type) {
    case 1:
    case 2:
    case 7:
      return 1;
    case 3:
      return 2;
    case 4:
    case 9:
      return 4;
    case 5:
    case 10:
      return 8;
    default:
      return 0;
  }
};

const readAscii = (
  bytes: Uint8Array,
  offset: number,
  count: number,
): string => {
  let result = "";
  for (let index = 0; index < count; index += 1) {
    const value = bytes[offset + index];
    if (value === 0 || value == null) break;
    result += String.fromCharCode(value);
  }
  return result;
};

const readRationalArray = (
  bytes: Uint8Array,
  offset: number,
  count: number,
  littleEndian: boolean,
): number[] => {
  const result: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const numerator = readUint32(bytes, offset + index * 8, littleEndian);
    const denominator = readUint32(bytes, offset + index * 8 + 4, littleEndian);
    if (denominator === 0) {
      result.push(0);
    } else {
      result.push(numerator / denominator);
    }
  }
  return result;
};

const parseGpsIfd = (
  bytes: Uint8Array,
  tiffOffset: number,
  gpsOffset: number,
  littleEndian: boolean,
): ExifGpsData | null => {
  const gpsIfdOffset = tiffOffset + gpsOffset;
  if (gpsIfdOffset + 2 > bytes.length) return null;

  const entryCount = readUint16(bytes, gpsIfdOffset, littleEndian);
  const gpsData: ExifGpsData = {};

  for (let index = 0; index < entryCount; index += 1) {
    const entryOffset = gpsIfdOffset + 2 + index * 12;
    if (entryOffset + 12 > bytes.length) break;

    const tag = readUint16(bytes, entryOffset, littleEndian);
    const type = readUint16(bytes, entryOffset + 2, littleEndian);
    const count = readUint32(bytes, entryOffset + 4, littleEndian);
    const valueSize = getTypeSize(type) * count;
    const valueOffset =
      valueSize <= 4
        ? entryOffset + 8
        : tiffOffset + readUint32(bytes, entryOffset + 8, littleEndian);

    if (valueOffset < 0 || valueOffset + valueSize > bytes.length) continue;

    if (tag === 0x0001 && type === 2) {
      gpsData.GPSLatitudeRef = readAscii(bytes, valueOffset, count);
    }

    if (tag === 0x0002 && type === 5) {
      gpsData.GPSLatitude = readRationalArray(bytes, valueOffset, count, littleEndian);
    }

    if (tag === 0x0003 && type === 2) {
      gpsData.GPSLongitudeRef = readAscii(bytes, valueOffset, count);
    }

    if (tag === 0x0004 && type === 5) {
      gpsData.GPSLongitude = readRationalArray(bytes, valueOffset, count, littleEndian);
    }
  }

  if (
    !gpsData.GPSLatitude &&
    !gpsData.GPSLongitude &&
    !gpsData.GPSLatitudeRef &&
    !gpsData.GPSLongitudeRef
  ) {
    return null;
  }

  return gpsData;
};

const parseJpegExifGps = (bytes: Uint8Array): ExifGpsData | null => {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;

    const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (segmentLength < 2) break;

    if (
      marker === 0xe1 &&
      offset + 10 <= bytes.length &&
      readAscii(bytes, offset + 4, 6) === "Exif"
    ) {
      const tiffOffset = offset + 10;
      const byteOrder = readAscii(bytes, tiffOffset, 2);
      const littleEndian = byteOrder === "II";
      if (byteOrder !== "II" && byteOrder !== "MM") return null;

      const fixed = readUint16(bytes, tiffOffset + 2, littleEndian);
      if (fixed !== 0x002a) return null;

      const ifd0Offset = readUint32(bytes, tiffOffset + 4, littleEndian);
      const ifd0Absolute = tiffOffset + ifd0Offset;
      if (ifd0Absolute + 2 > bytes.length) return null;

      const entryCount = readUint16(bytes, ifd0Absolute, littleEndian);
      for (let index = 0; index < entryCount; index += 1) {
        const entryOffset = ifd0Absolute + 2 + index * 12;
        if (entryOffset + 12 > bytes.length) break;

        const tag = readUint16(bytes, entryOffset, littleEndian);
        if (tag !== 0x8825) continue;

        const gpsOffset = readUint32(bytes, entryOffset + 8, littleEndian);
        return parseGpsIfd(bytes, tiffOffset, gpsOffset, littleEndian);
      }
    }

    offset += 2 + segmentLength;
  }

  return null;
};

export const readExifGpsFromUri = async (
  uri: string | null | undefined,
): Promise<ExifGpsData | null> => {
  if (!uri) return null;

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return parseJpegExifGps(base64ToBytes(base64));
  } catch (error) {
    console.warn("Failed to read EXIF from file URI:", error);
    return null;
  }
};
