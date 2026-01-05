"""
Tea Factory Geocoding Script

This script geocodes tea factory addresses using the Nominatim (OpenStreetMap) API.
Rate limited to 1 request per second as per Nominatim usage policy.
"""

import pandas as pd
import numpy as np
import time
import requests
from pathlib import Path
from datetime import datetime

# Define paths
BASE_DIR = Path(__file__).parent.parent.parent
EXT_DIR = BASE_DIR / "ext"

# Nominatim API configuration
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "TeaFactoryGeocoder/1.0 (Ceylon Tea Intelligence Platform)"
RATE_LIMIT_SECONDS = 1.5  # Increased to 1.5s to be safer


def geocode_address(query, session):
    """
    Geocode a single address using Nominatim API.
    
    Returns: tuple of (latitude, longitude) or (None, None) if not found
    """
    params = {
        'q': query,
        'format': 'json',
        'limit': 1,
        'countrycodes': 'lk',  # Sri Lanka
    }
    
    headers = {
        'User-Agent': USER_AGENT
    }
    
    try:
        response = session.get(NOMINATIM_URL, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        results = response.json()
        
        if results and len(results) > 0:
            lat = float(results[0]['lat'])
            lon = float(results[0]['lon'])
            return lat, lon
        else:
            return None, None
            
    except Exception as e:
        print(f"    Error geocoding: {e}")
        return None, None


def load_prepared_data():
    """Load the prepared factory data."""
    # Check for partial file first to resume
    partial_path = EXT_DIR / "Fac_details_enriched_partial.xlsx"
    if partial_path.exists():
        print(f"Resuming from partial file: {partial_path}...")
        df = pd.read_excel(partial_path)
        print(f"  Loaded {len(df)} records (resuming)")
        return df

    filepath = EXT_DIR / "Fac_details_prepared.xlsx"
    print(f"Loading prepared data from {filepath}...")
    df = pd.read_excel(filepath)
    print(f"  Loaded {len(df)} records")
    return df


def geocode_factories(df):
    """Geocode all factories that need geocoding."""
    print("\nStarting geocoding process...")
    
    # Find factories that need geocoding (have a query with 'Sri Lanka' but no coordinates yet)
    needs_geocoding = df[
        (df['GeocodingQuery'].str.contains('Sri Lanka', na=False)) & 
        (df['Latitude'].isna())
    ].copy()
    
    total = len(needs_geocoding)
    print(f"  Factories to geocode: {total}")
    print(f"  Estimated time: ~{total} seconds ({total // 60} min {total % 60} sec)")
    print()
    
    # Create a session for connection pooling
    session = requests.Session()
    
    # Track progress
    success_count = 0
    failed_count = 0
    start_time = datetime.now()
    
    for i, (idx, row) in enumerate(needs_geocoding.iterrows(), 1):
        query = row['GeocodingQuery']
        factory_name = row['facName']
        
        # Progress update every 50 records
        if i % 50 == 0 or i == 1:
            elapsed = (datetime.now() - start_time).total_seconds()
            rate = i / elapsed if elapsed > 0 else 0
            remaining = (total - i) / rate if rate > 0 else 0
            print(f"  Progress: {i}/{total} ({i*100//total}%) - Success: {success_count}, Failed: {failed_count} - ETA: {remaining/60:.1f} min")
        
        # Geocode
        lat, lon = geocode_address(query, session)
        
        if lat is not None and lon is not None:
            df.at[idx, 'Latitude'] = lat
            df.at[idx, 'Longitude'] = lon
            df.at[idx, 'GeocodingSource'] = 'Nominatim'
            success_count += 1
        else:
            failed_count += 1
            # Try with just district + Sri Lanka as fallback
            district = row.get('AdminDistrict')
            if pd.notna(district):
                fallback_query = f"{district}, Sri Lanka"
                lat, lon = geocode_address(fallback_query, session)
                time.sleep(RATE_LIMIT_SECONDS)
                
                if lat is not None and lon is not None:
                    df.at[idx, 'Latitude'] = lat
                    df.at[idx, 'Longitude'] = lon
                    df.at[idx, 'GeocodingSource'] = 'Nominatim-District'
                    success_count += 1
                    failed_count -= 1
        
        # Save progress every 50 records
        if i % 50 == 0:
            temp_path = EXT_DIR / "Fac_details_enriched_partial.xlsx"
            df.to_excel(temp_path, index=False)
            print(f"  [Checkpoint] Saved progress to {temp_path.name}")
        
        # Rate limiting
        time.sleep(RATE_LIMIT_SECONDS)
    
    session.close()
    
    elapsed_total = (datetime.now() - start_time).total_seconds()
    print(f"\n  Geocoding complete!")
    print(f"  Total time: {elapsed_total/60:.1f} minutes")
    print(f"  Success: {success_count}")
    print(f"  Failed: {failed_count}")
    
    return df


def save_enriched_data(df):
    """Save the fully enriched dataset."""
    output_path = EXT_DIR / "Fac_details_enriched.xlsx"
    
    print(f"\nSaving enriched data to {output_path}...")
    df.to_excel(output_path, index=False)
    print(f"  Saved {len(df)} records")
    
    # Print final summary
    has_coords = df['Latitude'].notna().sum()
    missing_coords = df['Latitude'].isna().sum()
    
    print(f"\n  Final Summary:")
    print(f"    Factories with coordinates: {has_coords}")
    print(f"    Factories without coordinates: {missing_coords}")
    print(f"\n  Geocoding source breakdown:")
    print(df['GeocodingSource'].value_counts(dropna=False).to_string())
    
    return output_path


def validate_coordinates(df):
    """Validate that coordinates fall within Sri Lanka bounds."""
    print("\nValidating coordinates...")
    
    # Sri Lanka approximate bounds
    LAT_MIN, LAT_MAX = 5.9, 9.9
    LON_MIN, LON_MAX = 79.5, 82.0
    
    has_coords = df[df['Latitude'].notna()]
    
    out_of_bounds = has_coords[
        (has_coords['Latitude'] < LAT_MIN) | 
        (has_coords['Latitude'] > LAT_MAX) |
        (has_coords['Longitude'] < LON_MIN) | 
        (has_coords['Longitude'] > LON_MAX)
    ]
    
    if len(out_of_bounds) > 0:
        print(f"  WARNING: {len(out_of_bounds)} coordinates outside Sri Lanka bounds!")
        print(out_of_bounds[['facName', 'Latitude', 'Longitude', 'GeocodingSource']].head(10).to_string())
    else:
        print(f"  All {len(has_coords)} coordinates are within Sri Lanka bounds ✓")


def main():
    """Main execution function."""
    print("=" * 60)
    print("TEA FACTORY GEOCODING - Phase 2: Geocoding")
    print("=" * 60)
    
    # Load prepared data
    df = load_prepared_data()
    
    # Geocode factories
    df = geocode_factories(df)
    
    # Validate coordinates
    validate_coordinates(df)
    
    # Save enriched data
    output_path = save_enriched_data(df)
    
    print("\n" + "=" * 60)
    print("Phase 2 Complete!")
    print(f"Output: {output_path}")
    print("=" * 60)
    
    return df


if __name__ == "__main__":
    main()
