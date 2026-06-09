import { Injectable } from '@nestjs/common';
import { GeocodeResult } from '../../domain/entities/maps.entities';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class InMemoryGeocodeCache {
  private readonly forward = new Map<string, CacheEntry<GeocodeResult>>();
  private readonly reverse = new Map<string, CacheEntry<GeocodeResult>>();

  getForward(key: string, ttlMs: number): GeocodeResult | null {
    return this.get(this.forward, key, ttlMs);
  }

  setForward(key: string, value: GeocodeResult, ttlMs: number): void {
    this.set(this.forward, key, value, ttlMs);
  }

  getReverse(key: string, ttlMs: number): GeocodeResult | null {
    return this.get(this.reverse, key, ttlMs);
  }

  setReverse(key: string, value: GeocodeResult, ttlMs: number): void {
    this.set(this.reverse, key, value, ttlMs);
  }

  private get(
    store: Map<string, CacheEntry<GeocodeResult>>,
    key: string,
    ttlMs: number,
  ): GeocodeResult | null {
    const entry = store.get(key);
    if (!entry) return null;

    if (Date.now() >= entry.expiresAt) {
      store.delete(key);
      return null;
    }

    void ttlMs;
    return entry.value;
  }

  private set(
    store: Map<string, CacheEntry<GeocodeResult>>,
    key: string,
    value: GeocodeResult,
    ttlMs: number,
  ): void {
    store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }
}
