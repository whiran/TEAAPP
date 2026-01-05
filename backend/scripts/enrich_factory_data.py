"""
Tea Factory Data Enrichment Script

This script enriches the Fac_details.xlsx dataset by:
1. Loading reference data from regional coordinate CSVs
2. Creating lookup dictionaries for mapping
3. Filling missing values based on existing patterns
4. Outputting a prepared dataset ready for geocoding
"""

import pandas as pd
import numpy as np
from pathlib import Path
import re

# Define paths
BASE_DIR = Path(__file__).parent.parent.parent
EXT_DIR = BASE_DIR / "ext"

def load_data():
    """Load all source data files."""
    print("Loading data files...")
    
    # Load main factory data
    factories = pd.read_excel(EXT_DIR / "Fac_details.xlsx")
    print(f"  Loaded {len(factories)} factories from Fac_details.xlsx")
    
    # Load ATC regional coordinates
    atc_coords = pd.read_csv(EXT_DIR / "Regional Cordinates - ATC.csv")
    print(f"  Loaded {len(atc_coords)} ATC regional offices")
    
    # Load TI regional coordinates
    ti_coords = pd.read_csv(EXT_DIR / "Regional Cordinates - TI.csv")
    print(f"  Loaded {len(ti_coords)} TI regions")
    
    return factories, atc_coords, ti_coords


def create_lookup_dictionaries(factories, atc_coords, ti_coords):
    """Create lookup dictionaries for data enrichment."""
    print("\nCreating lookup dictionaries...")
    
    lookups = {}
    
    # ATC Region -> Coordinates
    lookups['atc_coords'] = {}
    for _, row in atc_coords.iterrows():
        region = row['ATC Region'].strip().upper() if pd.notna(row.get('ATC Region')) else None
        if region and pd.notna(row.get('Geo Coordinates')):
            coords = row['Geo Coordinates'].strip()
            lat, lon = [float(x.strip()) for x in coords.split(',')]
            lookups['atc_coords'][region] = (lat, lon)
    print(f"  ATC Region coords: {len(lookups['atc_coords'])} entries")
    
    # TI Region -> Coordinates
    lookups['ti_coords'] = {}
    for _, row in ti_coords.iterrows():
        region = row['TI Region'].strip().upper() if pd.notna(row.get('TI Region')) else None
        if region and pd.notna(row.get('Geo Coordinates')):
            coords = row['Geo Coordinates'].strip()
            lat, lon = [float(x.strip()) for x in coords.split(',')]
            lookups['ti_coords'][region] = (lat, lon)
    print(f"  TI Region coords: {len(lookups['ti_coords'])} entries")
    
    # District -> ATC Region mapping from existing data
    lookups['district_to_atc'] = {}
    district_atc = factories.dropna(subset=['AdminDistrict', 'ATCReg'])
    for _, row in district_atc.iterrows():
        district = row['AdminDistrict'].strip().upper()
        atc = row['ATCReg'].strip().upper()
        if district not in lookups['district_to_atc']:
            lookups['district_to_atc'][district] = atc
    print(f"  District->ATC mapping: {len(lookups['district_to_atc'])} entries")
    
    # DSDivision -> InspectorRegion mapping from existing data  
    lookups['dsd_to_inspector'] = {}
    dsd_inspector = factories.dropna(subset=['DSDivision', 'InspectorRegion'])
    for _, row in dsd_inspector.iterrows():
        dsd = row['DSDivision'].strip().upper()
        inspector = row['InspectorRegion'].strip().upper()
        if dsd not in lookups['dsd_to_inspector']:
            lookups['dsd_to_inspector'][dsd] = inspector
    print(f"  DSDivision->InspectorRegion mapping: {len(lookups['dsd_to_inspector'])} entries")
    
    # District -> subelevation patterns
    lookups['district_elevation_to_sub'] = {}
    de_sub = factories.dropna(subset=['AdminDistrict', 'Elvation', 'subelevation'])
    for _, row in de_sub.iterrows():
        key = (row['AdminDistrict'].strip().upper(), row['Elvation'].strip().upper())
        sub = row['subelevation'].strip().upper()
        if key not in lookups['district_elevation_to_sub']:
            lookups['district_elevation_to_sub'][key] = sub
    print(f"  District+Elevation->Subelevation mapping: {len(lookups['district_elevation_to_sub'])} entries")
    
    # ATCReg -> InspectorRegion mapping from TI data
    lookups['atc_to_inspectors'] = {}
    for _, row in ti_coords.iterrows():
        district = row['District'].strip().upper() if pd.notna(row.get('District')) else None
        ti_region = row['TI Region'].strip().upper() if pd.notna(row.get('TI Region')) else None
        if district and ti_region:
            if district not in lookups['atc_to_inspectors']:
                lookups['atc_to_inspectors'][district] = []
            lookups['atc_to_inspectors'][district].append(ti_region)
    print(f"  ATCReg->InspectorRegions mapping: {len(lookups['atc_to_inspectors'])} entries")
    
    return lookups


def fill_missing_values(factories, lookups):
    """Fill missing values using lookup dictionaries."""
    print("\nFilling missing values...")
    
    df = factories.copy()
    stats = {'before': {}, 'after': {}}
    
    # Track missing values before
    for col in df.columns:
        stats['before'][col] = df[col].isna().sum()
    
    # Fill ATCReg from District
    mask = df['ATCReg'].isna() & df['AdminDistrict'].notna()
    for idx in df[mask].index:
        district = df.at[idx, 'AdminDistrict'].strip().upper()
        if district in lookups['district_to_atc']:
            df.at[idx, 'ATCReg'] = lookups['district_to_atc'][district]
    print(f"  Filled ATCReg: {stats['before']['ATCReg'] - df['ATCReg'].isna().sum()} values")
    
    # Fill InspectorRegion from DSDivision
    mask = df['InspectorRegion'].isna() & df['DSDivision'].notna()
    for idx in df[mask].index:
        dsd = df.at[idx, 'DSDivision'].strip().upper()
        if dsd in lookups['dsd_to_inspector']:
            df.at[idx, 'InspectorRegion'] = lookups['dsd_to_inspector'][dsd]
    print(f"  Filled InspectorRegion: {stats['before']['InspectorRegion'] - df['InspectorRegion'].isna().sum()} values")
    
    # Fill subelevation from District + Elevation
    mask = df['subelevation'].isna() & df['AdminDistrict'].notna() & df['Elvation'].notna()
    for idx in df[mask].index:
        district = df.at[idx, 'AdminDistrict'].strip().upper()
        elevation = df.at[idx, 'Elvation'].strip().upper()
        key = (district, elevation)
        if key in lookups['district_elevation_to_sub']:
            df.at[idx, 'subelevation'] = lookups['district_elevation_to_sub'][key]
    print(f"  Filled subelevation: {stats['before']['subelevation'] - df['subelevation'].isna().sum()} values")
    
    # Track missing values after
    for col in df.columns:
        stats['after'][col] = df[col].isna().sum()
    
    # Print summary
    print("\n  Missing values summary (before -> after):")
    for col in ['ATCReg', 'InspectorRegion', 'subelevation', 'DSDivision', 'FacAddress']:
        before = stats['before'][col]
        after = df[col].isna().sum()
        print(f"    {col}: {before} -> {after}")
    
    return df, stats


def prepare_for_geocoding(df, lookups):
    """Prepare the dataset for geocoding by adding helper columns."""
    print("\nPreparing for geocoding...")
    
    # Add new columns for geocoding results
    df['Latitude'] = np.nan
    df['Longitude'] = np.nan
    df['GeocodingSource'] = ''
    df['GeocodingQuery'] = ''
    
    # Build geocoding query for each factory
    for idx in df.index:
        address = df.at[idx, 'FacAddress']
        district = df.at[idx, 'AdminDistrict']
        
        if pd.notna(address):
            # Build full address for geocoding
            query_parts = [str(address).strip()]
            if pd.notna(district):
                query_parts.append(str(district).strip())
            query_parts.append('Sri Lanka')
            df.at[idx, 'GeocodingQuery'] = ', '.join(query_parts)
        else:
            # Use Inspector Region or ATC Region as fallback
            inspector = df.at[idx, 'InspectorRegion']
            atc = df.at[idx, 'ATCReg']
            
            if pd.notna(inspector):
                inspector_upper = str(inspector).strip().upper()
                if inspector_upper in lookups['ti_coords']:
                    lat, lon = lookups['ti_coords'][inspector_upper]
                    df.at[idx, 'Latitude'] = lat
                    df.at[idx, 'Longitude'] = lon
                    df.at[idx, 'GeocodingSource'] = 'InspectorRegion'
                    df.at[idx, 'GeocodingQuery'] = f"TI Region: {inspector}"
            
            if pd.isna(df.at[idx, 'Latitude']) and pd.notna(atc):
                atc_upper = str(atc).strip().upper()
                if atc_upper in lookups['atc_coords']:
                    lat, lon = lookups['atc_coords'][atc_upper]
                    df.at[idx, 'Latitude'] = lat
                    df.at[idx, 'Longitude'] = lon
                    df.at[idx, 'GeocodingSource'] = 'ATCRegion'
                    df.at[idx, 'GeocodingQuery'] = f"ATC Region: {atc}"
    
    # Count geocoding preparation status
    has_coords = df['Latitude'].notna().sum()
    needs_geocoding = df['GeocodingQuery'].str.contains('Sri Lanka', na=False).sum()
    no_query = (df['GeocodingQuery'] == '').sum()
    
    print(f"  Factories with pre-filled coords (from regions): {has_coords}")
    print(f"  Factories needing API geocoding: {needs_geocoding}")
    print(f"  Factories with no geocoding query: {no_query}")
    
    return df


def save_prepared_data(df):
    """Save the prepared dataset."""
    output_path = EXT_DIR / "Fac_details_prepared.xlsx"
    
    print(f"\nSaving prepared data to {output_path}...")
    df.to_excel(output_path, index=False)
    print(f"  Saved {len(df)} records")
    
    return output_path


def main():
    """Main execution function."""
    print("=" * 60)
    print("TEA FACTORY DATA ENRICHMENT - Phase 1: Data Preparation")
    print("=" * 60)
    
    # Load data
    factories, atc_coords, ti_coords = load_data()
    
    # Create lookup dictionaries
    lookups = create_lookup_dictionaries(factories, atc_coords, ti_coords)
    
    # Fill missing values
    enriched_df, stats = fill_missing_values(factories, lookups)
    
    # Prepare for geocoding
    prepared_df = prepare_for_geocoding(enriched_df, lookups)
    
    # Save prepared data
    output_path = save_prepared_data(prepared_df)
    
    print("\n" + "=" * 60)
    print("Phase 1 Complete!")
    print(f"Output: {output_path}")
    print("=" * 60)
    
    return prepared_df


if __name__ == "__main__":
    main()
